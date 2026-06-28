import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { ReembolsosService } from '../reembolsos/reembolsos.service';
import { ReservaCanceladaEvent } from './events/reserva-cancelada.event';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotReserva } from '../audit-log/snapshots';
import { ListReservasQueryDto } from './dto/list-reservas-query.dto';

// ──── Boleto view shape ───────────────────────────────────────────────────────
export interface BoletoAsiento {
  id: string;
  codigo: string;
  fila: string;
  columna: number;
  tipo_asiento: string | null;
  precio: string | null;
}

export interface BoletoView {
  id: string;
  numero_reserva: string;
  estado: string;
  created_at: Date;
  id_funcion: string;
  fecha_hora: Date;
  pelicula: {
    id: string;
    titulo: string;
    poster_url: string | null;
    rating_promedio: string | null;
    rating_count: number;
  };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: BoletoAsiento[];
  monto_total: string | null;
  ultimos4_snapshot: string | null;
  marca_snapshot: string | null;
}

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reembolsosService: ReembolsosService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLog: AuditLogService,
  ) {}

  async crear(
    idFuncion: string,
    idsAsientoFuncion: string[],
    idUsuarioActual: string,
  ) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(idFuncion) },
      select: { id: true, salas: { select: { id_cine: true } } },
    });
    if (!funcion) {
      throw new NotFoundException({
        code: 'FUNCION_NO_ENCONTRADA',
        message: 'La función no existe',
      });
    }

    const idCine = funcion.salas.id_cine;
    const idsBig = idsAsientoFuncion.map((s) => BigInt(s));
    const idUserBig = BigInt(idUsuarioActual);

    return this.prisma.$transaction(async (tx) => {
      const asientos = await tx.asientosFuncion.findMany({
        where: { id: { in: idsBig }, id_funcion: funcion.id },
        include: {
          asientos: {
            select: {
              codigo: true,
              id_tipo_asiento: true,
              tipoAsiento: { select: { nombre: true } },
            },
          },
        },
      });

      if (asientos.length !== idsBig.length) {
        throw new NotFoundException({
          code: 'ASIENTO_INVALIDO',
          message: 'Algún asiento no pertenece a la función',
        });
      }

      const ahora = new Date();
      for (const a of asientos) {
        if ((a.estado as EstadoAsiento) !== EstadoAsiento.BLOQUEADO) {
          throw new ConflictException({
            code: 'BLOQUEO_EXPIRADO',
            message:
              'El bloqueo ya no es válido (estado actual: ' + a.estado + ')',
          });
        }
        if (a.id_usuario !== idUserBig) {
          throw new ForbiddenException({
            code: 'BLOQUEO_NO_ES_DEL_USUARIO',
            message: 'No podés reservar bloqueos de otro usuario',
          });
        }
        if (a.bloqueado_hasta <= ahora) {
          throw new ConflictException({
            code: 'BLOQUEO_EXPIRADO',
            message: 'El bloqueo expiró',
          });
        }
      }

      const tiposAsientoIds = Array.from(
        new Set(asientos.map((a) => a.asientos.id_tipo_asiento)),
      );
      const precios = await tx.preciosCine.findMany({
        where: { id_cine: idCine, id_tipo_asiento: { in: tiposAsientoIds } },
        select: { id_tipo_asiento: true, precio: true },
      });
      const precioPorTipo = new Map(
        precios.map((p) => [p.id_tipo_asiento, Number(p.precio.toString())]),
      );

      const totalEstimado = asientos.reduce((acc, a) => {
        const precio = precioPorTipo.get(a.asientos.id_tipo_asiento);
        if (precio === undefined) {
          throw new ConflictException({
            code: 'PRECIO_NO_CONFIGURADO',
            message: `El cine no tiene precio configurado para el tipo "${a.asientos.tipoAsiento.nombre}"`,
          });
        }
        return acc + precio;
      }, 0);

      const numeroReserva = await this.generarNumeroUnico(tx);

      const reserva = await tx.reservas.create({
        data: {
          numero_reserva: numeroReserva,
          id_usuario: idUserBig,
          id_funcion: funcion.id,
          estado: EstadoReserva.PENDIENTE_PAGO,
        },
      });

      await tx.reservaAsientos.createMany({
        data: idsBig.map((id) => ({
          id_reserva: reserva.id,
          id_asiento_funcion: id,
        })),
      });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: idsBig } },
        data: { estado: EstadoAsiento.RESERVADO },
      });

      return {
        id_reserva: reserva.id.toString(),
        numero_reserva: reserva.numero_reserva,
        estado: reserva.estado,
        asientos: asientos.map((a) => ({
          codigo: a.asientos.codigo,
          tipo: a.asientos.tipoAsiento.nombre,
        })),
        total_estimado: totalEstimado.toFixed(2),
      };
    });
  }

  async cancelar(idReserva: string, idUsuarioActual: string) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(idReserva) },
      include: { reservaAsientos: { select: { id_asiento_funcion: true } } },
    });
    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }
    if (reserva.id_usuario !== BigInt(idUsuarioActual)) {
      throw new ForbiddenException({
        code: 'RESERVA_NO_ES_DEL_USUARIO',
        message: 'Esta reserva no te pertenece',
      });
    }

    const calculo = await this.reembolsosService.calcularMonto(reserva.id);

    const prevReserva = await this.prisma.reservas.findUniqueOrThrow({
      where: { id: reserva.id },
      include: {
        usuarios: true,
        funciones: { include: { peliculas: true, salas: true } },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: true } } },
        },
        pagos: true,
      },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: {
          id: reserva.id,
          estado: {
            in: [EstadoReserva.PENDIENTE_PAGO, EstadoReserva.PAGADA],
          },
        },
        data: { estado: EstadoReserva.CANCELADA },
      });
      if (claim.count !== 1) {
        throw new ConflictException({
          code: 'RESERVA_NO_CANCELABLE',
          message: 'La reserva ya fue cancelada o cambió de estado',
        });
      }

      const idsAsientoFuncion = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );
      if (idsAsientoFuncion.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: idsAsientoFuncion } },
          data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
        });
      }

      let reembolso: { id: bigint; estado: string } | null = null;
      if (calculo.pagoId !== null) {
        reembolso = await this.reembolsosService.crearReembolso(
          tx,
          calculo.pagoId,
          calculo.monto,
          calculo.porcentaje,
          calculo.politicaId,
        );
      }

      const refreshed = await tx.reservas.findUniqueOrThrow({
        where: { id: reserva.id },
      });

      return { reserva: refreshed, reembolso };
    });

    await this.auditLog.registrar({
      id_usuario: BigInt(idUsuarioActual),
      id_auditor: BigInt(idUsuarioActual),
      accion: 'RESERVA_CANCELAR',
      entidad: 'Reserva',
      entidad_id: BigInt(idReserva),
      detalle: `Reserva ${idReserva} cancelada`,
      valor_anterior: snapshotReserva(prevReserva),
    });

    this.eventEmitter.emit(
      ReservaCanceladaEvent.NAME,
      new ReservaCanceladaEvent(
        result.reserva.id.toString(),
        result.reserva.id_usuario.toString(),
        result.reembolso?.id.toString() ?? null,
      ),
    );

    return {
      id_reserva: result.reserva.id.toString(),
      estado: result.reserva.estado,
      monto_reembolso: calculo.monto.toFixed(2),
      id_reembolso: result.reembolso?.id.toString() ?? null,
      fecha_cancelacion: result.reserva.updated_at.toISOString(),
    };
  }

  // ──── /me/reservas helpers ─────────────────────────────────────────────────

  private readonly incluirBoleto = {
    funciones: {
      include: {
        peliculas: {
          select: {
            id: true,
            titulo: true,
            poster_url: true,
            rating_promedio: true,
            rating_count: true,
          },
        },
        salas: {
          include: { cines: { select: { id: true, nombre: true } } },
        },
      },
    },
    reservaAsientos: {
      include: {
        asientosfuncion: {
          include: {
            asientos: {
              include: {
                tipoAsiento: { select: { nombre: true } },
              },
            },
          },
        },
      },
    },
    pagos: {
      orderBy: { created_at: 'desc' as const },
      take: 1,
    },
  };

  private toBoletoView(
    r: any,
    preciosPorTipo: Map<bigint, string>,
  ): BoletoView {
    const pago = r.pagos?.[0] ?? null;
    return {
      id: r.id.toString(),
      numero_reserva: r.numero_reserva,
      estado: r.estado,
      created_at: r.created_at,
      id_funcion: r.id_funcion.toString(),
      fecha_hora: r.funciones.fecha_hora,
      pelicula: {
        id: r.funciones.peliculas.id.toString(),
        titulo: r.funciones.peliculas.titulo,
        poster_url: r.funciones.peliculas.poster_url ?? null,
        rating_promedio: r.funciones.peliculas.rating_promedio?.toString() ?? null,
        rating_count: r.funciones.peliculas.rating_count,
      },
      sala: {
        id: r.funciones.salas.id.toString(),
        nombre: r.funciones.salas.nombre,
      },
      cine: {
        id: r.funciones.salas.cines.id.toString(),
        nombre: r.funciones.salas.cines.nombre,
      },
      asientos: r.reservaAsientos.map((ra: any) => ({
        id: ra.asientosfuncion.id.toString(),
        codigo: ra.asientosfuncion.asientos.codigo,
        fila: ra.asientosfuncion.asientos.fila,
        columna: ra.asientosfuncion.asientos.columna,
        tipo_asiento: ra.asientosfuncion.asientos.tipoAsiento?.nombre ?? null,
        precio:
          preciosPorTipo.get(ra.asientosfuncion.asientos.id_tipo_asiento) ??
          null,
      })),
      monto_total: pago ? pago.monto_final.toString() : null,
      ultimos4_snapshot: pago?.ultimos4_snapshot ?? null,
      marca_snapshot: pago?.marca_snapshot ?? null,
    };
  }

  private async buildPreciosPorTipo(
    reservas: any[],
  ): Promise<Map<bigint, string>> {
    if (reservas.length === 0) return new Map();

    // Collect all (idCine, idTipoAsiento) pairs across all reservas
    const pairs = new Set<string>();
    const idCineSet = new Set<bigint>();
    const idTipoSet = new Set<bigint>();

    for (const r of reservas) {
      const idCine: bigint = r.funciones.salas.id_cine;
      for (const ra of r.reservaAsientos) {
        const idTipo: bigint = ra.asientosfuncion.asientos.id_tipo_asiento;
        const key = `${idCine}:${idTipo}`;
        if (!pairs.has(key)) {
          pairs.add(key);
          idCineSet.add(idCine);
          idTipoSet.add(idTipo);
        }
      }
    }

    const precios = await this.prisma.preciosCine.findMany({
      where: {
        id_cine: { in: Array.from(idCineSet) },
        id_tipo_asiento: { in: Array.from(idTipoSet) },
      },
      select: { id_tipo_asiento: true, precio: true },
    });

    // Key by id_tipo_asiento (sufficient when cinema shares type pricing)
    return new Map(
      precios.map((p) => [p.id_tipo_asiento, p.precio.toString()]),
    );
  }

  async findMisReservas(userId: string, estado?: string): Promise<BoletoView[]> {
    const where: Record<string, unknown> = { id_usuario: BigInt(userId) };
    if (estado) where['estado'] = estado;

    const reservas = await this.prisma.reservas.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: this.incluirBoleto,
    });

    const preciosPorTipo = await this.buildPreciosPorTipo(reservas);
    return reservas.map((r) => this.toBoletoView(r, preciosPorTipo));
  }

  async findOneByNumero(numero: string, userId: string): Promise<BoletoView> {
    const reserva = await this.prisma.reservas.findFirst({
      where: { numero_reserva: numero, id_usuario: BigInt(userId) },
      include: this.incluirBoleto,
    });

    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'Reserva no encontrada',
      });
    }

    const preciosPorTipo = await this.buildPreciosPorTipo([reserva]);
    return this.toBoletoView(reserva, preciosPorTipo);
  }

  async cancelarPorCliente(numero: string, userId: string) {
    const reserva = await this.prisma.reservas.findFirst({
      where: { numero_reserva: numero, id_usuario: BigInt(userId) },
      include: { reservaAsientos: { select: { id_asiento_funcion: true } } },
    });

    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'Reserva no encontrada',
      });
    }

    const calculo = await this.reembolsosService.calcularMonto(reserva.id);

    const prevReserva = await this.prisma.reservas.findUniqueOrThrow({
      where: { id: reserva.id },
      include: {
        usuarios: true,
        funciones: { include: { peliculas: true, salas: true } },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: true } } },
        },
        pagos: true,
      },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: {
          id: reserva.id,
          estado: {
            in: [EstadoReserva.PENDIENTE_PAGO, EstadoReserva.PAGADA],
          },
        },
        data: { estado: EstadoReserva.CANCELADA },
      });
      if (claim.count !== 1) {
        throw new ConflictException({
          code: 'RESERVA_NO_CANCELABLE',
          message: 'La reserva ya fue cancelada o cambió de estado',
        });
      }

      const idsAsientoFuncion = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );
      if (idsAsientoFuncion.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: idsAsientoFuncion } },
          data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
        });
      }

      let reembolso: { id: bigint; estado: string } | null = null;
      if (calculo.pagoId !== null) {
        reembolso = await this.reembolsosService.crearReembolso(
          tx,
          calculo.pagoId,
          calculo.monto,
          calculo.porcentaje,
          calculo.politicaId,
        );
      }

      const refreshed = await tx.reservas.findUniqueOrThrow({
        where: { id: reserva.id },
      });

      return { reserva: refreshed, reembolso };
    });

    await this.auditLog.registrar({
      id_usuario: BigInt(userId),
      id_auditor: BigInt(userId),
      accion: 'RESERVA_CANCELAR',
      entidad: 'Reserva',
      entidad_id: reserva.id,
      detalle: `Reserva ${numero} cancelada por cliente`,
      valor_anterior: snapshotReserva(prevReserva),
    });

    this.eventEmitter.emit(
      ReservaCanceladaEvent.NAME,
      new ReservaCanceladaEvent(
        result.reserva.id.toString(),
        result.reserva.id_usuario.toString(),
        result.reembolso?.id.toString() ?? null,
      ),
    );

    return {
      reserva: {
        id_reserva: result.reserva.id.toString(),
        numero_reserva: result.reserva.numero_reserva,
        estado: result.reserva.estado,
        fecha_cancelacion: result.reserva.updated_at.toISOString(),
      },
      reembolso: result.reembolso
        ? {
            id_reembolso: result.reembolso.id.toString(),
            estado: result.reembolso.estado,
            monto: calculo.monto.toFixed(2),
          }
        : null,
    };
  }

  // ──── Admin helpers ─────────────────────────────────────────────────────────

  async findAdminPaginated(q: ListReservasQueryDto) {
    const where: Record<string, any> = {};

    if (q.estado) where['estado'] = q.estado;

    if (q.id_funcion) where['id_funcion'] = BigInt(q.id_funcion);

    if (q.q) {
      where['OR'] = [
        { numero_reserva: { contains: q.q, mode: 'insensitive' } },
        { usuarios: { nombre: { contains: q.q, mode: 'insensitive' } } },
        { usuarios: { email: { contains: q.q, mode: 'insensitive' } } },
      ];
    }

    if (q.fecha_desde || q.fecha_hasta) {
      where['created_at'] = {};
      if (q.fecha_desde) where['created_at']['gte'] = new Date(q.fecha_desde);
      if (q.fecha_hasta) where['created_at']['lte'] = new Date(q.fecha_hasta);
    }

    if (q.id_cine || q.id_pelicula) {
      where['funciones'] = {
        ...(q.id_pelicula ? { id_pelicula: BigInt(q.id_pelicula) } : {}),
        ...(q.id_cine
          ? { salas: { id_cine: BigInt(q.id_cine) } }
          : {}),
      };
    }

    const skip = (q.page - 1) * q.limit;
    const take = q.limit;

    const [rows, total] = await Promise.all([
      this.prisma.reservas.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          usuarios: { select: { id: true, nombre: true, email: true } },
          funciones: {
            include: {
              peliculas: { select: { id: true, titulo: true } },
              salas: {
                include: { cines: { select: { id: true, nombre: true } } },
              },
            },
          },
          reservaAsientos: {
            include: {
              asientosfuncion: {
                include: {
                  asientos: {
                    include: { tipoAsiento: { select: { nombre: true } } },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.reservas.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toAdminReservaRow(r)),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  private toAdminReservaRow(r: any) {
    return {
      id: r.id.toString(),
      numero_reserva: r.numero_reserva,
      estado: r.estado,
      created_at: r.created_at,
      cliente: {
        id: r.usuarios.id.toString(),
        nombre: r.usuarios.nombre,
        email: r.usuarios.email,
      },
      funcion: {
        id: r.funciones.id.toString(),
        fecha_hora: r.funciones.fecha_hora,
      },
      pelicula: {
        id: r.funciones.peliculas.id.toString(),
        titulo: r.funciones.peliculas.titulo,
      },
      cine: {
        id: r.funciones.salas.cines.id.toString(),
        nombre: r.funciones.salas.cines.nombre,
      },
      sala: {
        id: r.funciones.salas.id.toString(),
        nombre: r.funciones.salas.nombre,
      },
      num_asientos: r.reservaAsientos.length,
      asientos: r.reservaAsientos.map((ra: any) => ({
        codigo: ra.asientosfuncion.asientos.codigo,
        tipo: ra.asientosfuncion.asientos.tipoAsiento?.nombre ?? null,
      })),
    };
  }

  async findOneAdmin(id: bigint) {
    const r = await this.prisma.reservas.findUnique({
      where: { id },
      include: {
        usuarios: { select: { id: true, nombre: true, email: true } },
        funciones: {
          include: {
            peliculas: { select: { id: true, titulo: true, poster_url: true } },
            salas: {
              include: { cines: { select: { id: true, nombre: true } } },
            },
          },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: {
                  include: { tipoAsiento: { select: { nombre: true } } },
                },
              },
            },
          },
        },
        pagos: {
          orderBy: { created_at: 'desc' as const },
          take: 1,
        },
      },
    });

    if (!r) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'Reserva no encontrada',
      });
    }

    const pago = r.pagos?.[0] ?? null;

    return {
      id: r.id.toString(),
      numero_reserva: r.numero_reserva,
      estado: r.estado,
      monto_total: pago ? pago.monto_final.toString() : null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      cliente: {
        id: r.usuarios.id.toString(),
        nombre: r.usuarios.nombre,
        email: r.usuarios.email,
      },
      funcion: {
        id: r.funciones.id.toString(),
        fecha_hora: r.funciones.fecha_hora,
        pelicula: {
          id: r.funciones.peliculas.id.toString(),
          titulo: r.funciones.peliculas.titulo,
          poster_url: r.funciones.peliculas.poster_url ?? null,
        },
        sala: {
          id: r.funciones.salas.id.toString(),
          nombre: r.funciones.salas.nombre,
        },
        cine: {
          id: r.funciones.salas.cines.id.toString(),
          nombre: r.funciones.salas.cines.nombre,
        },
      },
      asientos: r.reservaAsientos.map((ra: any) => ({
        id: ra.asientosfuncion.id.toString(),
        codigo: ra.asientosfuncion.asientos.codigo,
        fila: ra.asientosfuncion.asientos.fila,
        columna: ra.asientosfuncion.asientos.columna,
        tipo: ra.asientosfuncion.asientos.tipoAsiento?.nombre ?? null,
      })),
      pago: pago
        ? {
            id: pago.id.toString(),
            monto_final: pago.monto_final.toString(),
            metodo: pago.metodo,
            estado: pago.estado,
            created_at: pago.created_at,
          }
        : null,
    };
  }

  async cancelarAdminReserva(
    id: bigint,
    actorId: string,
  ) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id },
      include: {
        usuarios: true,
        funciones: { include: { peliculas: true, salas: true } },
        reservaAsientos: {
          select: { id_asiento_funcion: true },
        },
        pagos: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'Reserva no encontrada',
      });
    }

    const calculo = await this.reembolsosService.calcularMonto(id);

    const prevReserva = await this.prisma.reservas.findUniqueOrThrow({
      where: { id },
      include: {
        usuarios: true,
        funciones: { include: { peliculas: true, salas: true } },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: true } } },
        },
        pagos: true,
      },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: {
          id,
          estado: {
            in: [EstadoReserva.PENDIENTE_PAGO, EstadoReserva.PAGADA],
          },
        },
        data: { estado: EstadoReserva.CANCELADA },
      });
      if (claim.count !== 1) {
        throw new ConflictException({
          code: 'RESERVA_NO_CANCELABLE',
          message: 'La reserva ya fue cancelada o cambió de estado',
        });
      }

      const idsAsientoFuncion = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );
      if (idsAsientoFuncion.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: idsAsientoFuncion } },
          data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
        });
      }

      let reembolso: { id: bigint; estado: string } | null = null;
      if (calculo.pagoId !== null) {
        reembolso = await this.reembolsosService.crearReembolso(
          tx,
          calculo.pagoId,
          calculo.monto,
          calculo.porcentaje,
          calculo.politicaId,
        );
      }

      const refreshed = await tx.reservas.findUniqueOrThrow({
        where: { id },
      });

      return { reserva: refreshed, reembolso };
    });

    await this.auditLog.registrar({
      id_usuario: BigInt(actorId),
      id_auditor: BigInt(actorId),
      accion: 'ADMIN_RESERVA_CANCELAR',
      entidad: 'Reserva',
      entidad_id: id,
      detalle: `Reserva ${id} cancelada por admin`,
      valor_anterior: snapshotReserva(prevReserva),
    });

    this.eventEmitter.emit(
      ReservaCanceladaEvent.NAME,
      new ReservaCanceladaEvent(
        result.reserva.id.toString(),
        result.reserva.id_usuario.toString(),
        result.reembolso?.id.toString() ?? null,
      ),
    );

    return {
      reserva: {
        id: result.reserva.id.toString(),
        numero_reserva: result.reserva.numero_reserva,
        estado: result.reserva.estado,
        fecha_cancelacion: result.reserva.updated_at.toISOString(),
      },
      reembolso: result.reembolso
        ? {
            id: result.reembolso.id.toString(),
            estado: result.reembolso.estado,
            monto: calculo.monto.toFixed(2),
          }
        : null,
    };
  }

  async findByNumeroForCobrar(numero: string) {
    const r = await this.prisma.reservas.findFirst({
      where: { numero_reserva: numero },
      include: {
        usuarios: { select: { id: true, nombre: true, email: true, telefono: true } },
        funciones: {
          include: {
            peliculas: { select: { id: true, titulo: true } },
            salas: {
              include: { cines: { select: { id: true, nombre: true } } },
            },
          },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: {
                  include: { tipoAsiento: { select: { nombre: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!r) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'Reserva no encontrada',
      });
    }

    const preciosPorTipo = await this.buildPreciosPorTipo([r]);

    const asientos = r.reservaAsientos.map((ra: any) => {
      const precio = preciosPorTipo.get(ra.asientosfuncion.asientos.id_tipo_asiento) ?? '0';
      return {
        id: ra.asientosfuncion.id.toString(),
        codigo: ra.asientosfuncion.asientos.codigo,
        tipo: ra.asientosfuncion.asientos.tipoAsiento?.nombre ?? 'Estándar',
        precio,
      };
    });

    const montoTotal = asientos.reduce(
      (sum: number, a: any) => sum + Number(a.precio),
      0,
    );

    return {
      id: r.id.toString(),
      numero_reserva: r.numero_reserva,
      estado: r.estado,
      created_at: r.created_at,
      expira_en: r.expira_en ?? null,
      cliente: {
        id: r.usuarios.id.toString(),
        nombre: r.usuarios.nombre,
        email: r.usuarios.email,
        telefono: r.usuarios.telefono ?? null,
      },
      pelicula: {
        id: r.funciones.peliculas.id.toString(),
        titulo: r.funciones.peliculas.titulo,
      },
      funcion: {
        id: r.funciones.id.toString(),
        fecha_hora: r.funciones.fecha_hora,
      },
      sala: {
        id: r.funciones.salas.id.toString(),
        nombre: r.funciones.salas.nombre,
      },
      cine: {
        id: r.funciones.salas.cines.id.toString(),
        nombre: r.funciones.salas.cines.nombre,
      },
      asientos,
      num_asientos: asientos.length,
      monto_total: montoTotal.toFixed(2),
    };
  }

  // ──── Private helpers ───────────────────────────────────────────────────────

  private async generarNumeroUnico(tx: {
    reservas: PrismaService['reservas'];
  }): Promise<string> {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let i = 0; i < 3; i++) {
      const sufijo = Math.random().toString(36).slice(2, 7).toUpperCase();
      const candidato = `RES-${fecha}-${sufijo}`;
      const existente = await tx.reservas.findUnique({
        where: { numero_reserva: candidato },
        select: { id: true },
      });
      if (!existente) return candidato;
    }
    throw new Error(
      'No se pudo generar numero_reserva único después de 3 intentos',
    );
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { EstadoReembolso } from '../../common/enums/estado-reembolso.enum';
import { PagoEstado } from '../../../generated/prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotReembolso } from '../audit-log/snapshots';
import { ListReembolsosQueryDto } from './dto/list-reembolsos-query.dto';
import { ProcesarReembolsoDto } from './dto/procesar-reembolso.dto';
import { RechazarReembolsoDto } from './dto/rechazar-reembolso.dto';

@Injectable()
export class ReembolsosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async calcularMonto(idReserva: bigint): Promise<{
    pagoId: bigint | null;
    monto: number;
    porcentaje: number;
    politicaId: bigint | null;
  }> {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: idReserva },
      include: {
        funciones: {
          select: {
            fecha_hora: true,
            salas: { select: { id_cine: true } },
          },
        },
        pagos: {
          where: { estado: PagoEstado.exitoso },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });
    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }
    const pago = reserva.pagos[0];
    if (!pago) {
      return { pagoId: null, monto: 0, porcentaje: 0, politicaId: null };
    }

    const horasFaltantes = Math.max(
      0,
      (reserva.funciones.fecha_hora.getTime() - Date.now()) / 3_600_000,
    );

    const idCine = reserva.funciones.salas.id_cine;
    const politica = await this.prisma.politicaCancelacion.findFirst({
      where: { id_cine: idCine, activa: true },
      include: {
        reglas: {
          where: {
            horas_antes_minimo: { lte: horasFaltantes },
            OR: [
              { horas_antes_maximo: null },
              { horas_antes_maximo: { gt: horasFaltantes } },
            ],
          },
          orderBy: { horas_antes_minimo: 'desc' },
          take: 1,
        },
      },
    });

    if (!politica || politica.reglas.length === 0) {
      return {
        pagoId: pago.id,
        monto: 0,
        porcentaje: 0,
        politicaId: politica?.id ?? null,
      };
    }

    const regla = politica.reglas[0];
    const porcentaje = Number(regla.porcentaje_reembolso.toString());
    const montoFinal = Number(pago.monto_final.toString());
    const monto = Math.round(((montoFinal * porcentaje) / 100) * 100) / 100;

    return { pagoId: pago.id, monto, porcentaje, politicaId: politica.id };
  }

  async crearReembolso(
    tx: Prisma.TransactionClient,
    pagoId: bigint,
    monto: number,
    porcentaje: number,
    politicaId: bigint | null,
  ): Promise<{ id: bigint; estado: EstadoReembolso }> {
    const procesadoYa = monto === 0;
    const reembolso = await tx.reembolsos.create({
      data: {
        id_pago: pagoId,
        id_politica: politicaId,
        porcentaje_aplicado: new Prisma.Decimal(porcentaje.toFixed(2)),
        monto: new Prisma.Decimal(monto.toFixed(2)),
        estado: procesadoYa
          ? EstadoReembolso.PROCESADO
          : EstadoReembolso.PENDIENTE,
        fecha_procesado: procesadoYa ? new Date() : null,
      },
    });
    return { id: reembolso.id, estado: reembolso.estado as EstadoReembolso };
  }

  async findMisReembolsos(userId: string) {
    const idUsuario = BigInt(userId);
    const rows = await this.prisma.reembolsos.findMany({
      where: {
        pagos: {
          is: {
            reservas: {
              is: { id_usuario: idUsuario },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      include: {
        pagos: {
          include: {
            reservas: { select: { numero_reserva: true } },
          },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id.toString(),
      numero_reserva: r.pagos.reservas.numero_reserva,
      monto: r.monto.toString(),
      estado: r.estado,
      porcentaje_aplicado: r.porcentaje_aplicado.toString(),
      fecha_procesado: r.fecha_procesado?.toISOString() ?? null,
      motivo_rechazo: r.motivo_rechazo ?? null,
    }));
  }

  async procesarEfectivo(idReembolso: string, auditorId: bigint) {
    const reembolso = await this.prisma.reembolsos.findUnique({
      where: { id: BigInt(idReembolso) },
    });
    if (!reembolso) {
      throw new NotFoundException({
        code: 'REEMBOLSO_NO_ENCONTRADO',
        message: 'El reembolso no existe',
      });
    }

    const claim = await this.prisma.reembolsos.updateMany({
      where: { id: reembolso.id, estado: EstadoReembolso.PENDIENTE },
      data: {
        estado: EstadoReembolso.PROCESADO,
        fecha_procesado: new Date(),
      },
    });
    if (claim.count !== 1) {
      throw new ConflictException({
        code: 'REEMBOLSO_NO_PROCESABLE',
        message: `El reembolso está en estado ${reembolso.estado}`,
      });
    }

    const refreshed = await this.prisma.reembolsos.findUniqueOrThrow({
      where: { id: reembolso.id },
    });
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'REEMBOLSO_PROCESAR',
      entidad: 'Reembolso',
      entidad_id: reembolso.id,
      detalle: `Reembolso ${idReembolso} procesado en efectivo`,
      valor_anterior: snapshotReembolso(reembolso),
      valor_nuevo: snapshotReembolso(refreshed),
    });
    return {
      id_reembolso: refreshed.id.toString(),
      monto: refreshed.monto.toString(),
      estado: refreshed.estado,
      fecha_procesado: refreshed.fecha_procesado?.toISOString() ?? null,
    };
  }

  // ──── Admin helpers ─────────────────────────────────────────────────────────

  private readonly adminReembolsoInclude = {
    pagos: {
      include: {
        reservas: {
          include: {
            usuarios: { select: { id: true, nombre: true, email: true } },
            funciones: {
              include: {
                peliculas: { select: { id: true, titulo: true } },
                salas: {
                  include: {
                    cines: { select: { id: true, nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    },
    politica: { select: { id: true, nombre: true } },
  } as const;

  private toAdminReembolsoRow(r: any) {
    const pago = r.pagos;
    const reserva = pago.reservas;
    const usuario = reserva.usuarios;
    const funcion = reserva.funciones;
    const pelicula = funcion.peliculas;
    const cine = funcion.salas.cines;
    const diasEnCola = Math.floor(
      (Date.now() - new Date(r.created_at).getTime()) / 86_400_000,
    );
    return {
      id: r.id.toString(),
      numero_reserva: reserva.numero_reserva,
      cliente: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
      },
      pelicula: {
        id: pelicula.id.toString(),
        titulo: pelicula.titulo,
      },
      cine: {
        id: cine.id.toString(),
        nombre: cine.nombre,
      },
      metodo_pago_original: pago.metodo,
      monto: r.monto.toString(),
      porcentaje_aplicado: r.porcentaje_aplicado.toString(),
      politica: r.politica
        ? { id: r.politica.id.toString(), nombre: r.politica.nombre }
        : null,
      dias_en_cola: diasEnCola,
      estado: r.estado,
      motivo_rechazo: r.motivo_rechazo ?? null,
      nota: r.nota ?? null,
      fecha_procesado: r.fecha_procesado?.toISOString() ?? null,
      created_at: r.created_at,
    };
  }

  async findAdminPaginated(q: ListReembolsosQueryDto) {
    const where: Record<string, any> = {};

    if (q.estado) where['estado'] = q.estado;

    if (q.metodo) {
      where['pagos'] = { metodo: q.metodo };
    }

    if (q.fecha_desde || q.fecha_hasta) {
      where['created_at'] = {};
      if (q.fecha_desde) where['created_at']['gte'] = new Date(q.fecha_desde);
      if (q.fecha_hasta) where['created_at']['lte'] = new Date(q.fecha_hasta);
    }

    if (q.q) {
      where['OR'] = [
        {
          pagos: {
            reservas: {
              numero_reserva: { contains: q.q, mode: 'insensitive' },
            },
          },
        },
        {
          pagos: {
            reservas: {
              usuarios: { nombre: { contains: q.q, mode: 'insensitive' } },
            },
          },
        },
        {
          pagos: {
            reservas: {
              usuarios: { email: { contains: q.q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const skip = (q.page - 1) * q.limit;
    const take = q.limit;

    const [rows, total] = await Promise.all([
      this.prisma.reembolsos.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: this.adminReembolsoInclude,
      }),
      this.prisma.reembolsos.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toAdminReembolsoRow(r)),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async findOneAdmin(id: bigint) {
    const r = await this.prisma.reembolsos.findUnique({
      where: { id },
      include: this.adminReembolsoInclude,
    });

    if (!r) {
      throw new NotFoundException({
        code: 'REEMBOLSO_NO_ENCONTRADO',
        message: 'El reembolso no existe',
      });
    }

    return this.toAdminReembolsoRow(r);
  }

  async procesar(id: bigint, dto: ProcesarReembolsoDto, actorId: bigint) {
    const r = await this.prisma.reembolsos.findUnique({ where: { id } });
    if (!r) {
      throw new NotFoundException({
        code: 'REEMBOLSO_NO_ENCONTRADO',
        message: 'El reembolso no existe',
      });
    }
    if (r.estado !== EstadoReembolso.PENDIENTE) {
      throw new ConflictException({
        code: 'REEMBOLSO_NO_PROCESABLE',
        message: 'Reembolso ya procesado o rechazado',
      });
    }

    const updated = await this.prisma.reembolsos.update({
      where: { id },
      data: {
        estado: EstadoReembolso.PROCESADO,
        fecha_procesado: new Date(),
        nota: dto.nota ?? null,
      },
    });

    await this.auditLog.registrar({
      id_usuario: actorId,
      id_auditor: actorId,
      accion: 'REEMBOLSO_PROCESAR',
      entidad: 'Reembolso',
      entidad_id: id,
      detalle: `Reembolso ${id.toString()} procesado`,
      valor_anterior: snapshotReembolso(r),
      valor_nuevo: snapshotReembolso(updated),
    });

    return {
      id: updated.id.toString(),
      estado: updated.estado,
      fecha_procesado: updated.fecha_procesado?.toISOString() ?? null,
      nota: updated.nota ?? null,
    };
  }

  async rechazar(id: bigint, dto: RechazarReembolsoDto, actorId: bigint) {
    const r = await this.prisma.reembolsos.findUnique({ where: { id } });
    if (!r) {
      throw new NotFoundException({
        code: 'REEMBOLSO_NO_ENCONTRADO',
        message: 'El reembolso no existe',
      });
    }
    if (r.estado !== EstadoReembolso.PENDIENTE) {
      throw new ConflictException({
        code: 'REEMBOLSO_NO_PROCESABLE',
        message: 'Reembolso ya procesado o rechazado',
      });
    }

    const updated = await this.prisma.reembolsos.update({
      where: { id },
      data: {
        estado: EstadoReembolso.RECHAZADO,
        motivo_rechazo: dto.motivo,
      },
    });

    await this.auditLog.registrar({
      id_usuario: actorId,
      id_auditor: actorId,
      accion: 'REEMBOLSO_RECHAZAR',
      entidad: 'Reembolso',
      entidad_id: id,
      detalle: `Reembolso ${id.toString()} rechazado: ${dto.motivo}`,
      valor_anterior: snapshotReembolso(r),
      valor_nuevo: snapshotReembolso(updated),
    });

    return {
      id: updated.id.toString(),
      estado: updated.estado,
      motivo_rechazo: updated.motivo_rechazo ?? null,
    };
  }

  async kpis() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const [pendientes, montoAgg, completados_30d] = await Promise.all([
      this.prisma.reembolsos.count({
        where: { estado: EstadoReembolso.PENDIENTE },
      }),
      this.prisma.reembolsos.aggregate({
        _sum: { monto: true },
        where: { estado: EstadoReembolso.PENDIENTE },
      }),
      this.prisma.reembolsos.count({
        where: {
          estado: EstadoReembolso.PROCESADO,
          fecha_procesado: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      pendientes,
      en_procesamiento: pendientes,
      monto_pendiente: montoAgg._sum.monto?.toString() ?? '0',
      completados_30d,
    };
  }
}

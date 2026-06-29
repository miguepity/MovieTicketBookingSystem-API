import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionDto } from './create-funciones.dto';
import { UpdateFuncionDto } from './update-funciones.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BloquearAsientosDto } from './bloquear-asientos.dto';
import { MailService } from '../mail/mail.service';
import { buildCancelledFunctionTemplate } from '../mail/templates/cancelled-function.template';
import { buildCashRefundNotificationTemplate } from '../mail/templates/cash-refund-notification.template';

@Injectable()
export class FuncionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private serializeFuncion(funcion: any) {
    return {
      ...funcion,
      id: Number(funcion.id),
      id_pelicula: Number(funcion.id_pelicula),
      id_sala: Number(funcion.id_sala),
    };
  }

  async create(createFuncionDto: CreateFuncionDto, auditorId: number) {
    const fechaInicioNueva = new Date(createFuncionDto.fecha_hora);
    const ahora = new Date();

    // 🌟 NUEVA VALIDACIÓN: Impedir la creación de funciones en fechas/horas pasadas
    if (fechaInicioNueva <= ahora) {
      throw new BadRequestException(
        'No puedes programar una función en una fecha u hora pasada. Debe ser una fecha futura.',
      );
    }

    const DURACION_PELICULA_MS = 120 * 60 * 1000;
    const margenInicioBusqueda = new Date(fechaInicioNueva.getTime() - DURACION_PELICULA_MS);
    const margenFinBusqueda = new Date(fechaInicioNueva.getTime() + DURACION_PELICULA_MS);

    const funcionesSolapadas = await this.prisma.funciones.findFirst({
      where: {
        id_sala: BigInt(createFuncionDto.id_sala),
        estado: { not: 'CANCELADA' },
        fecha_hora: {
          gte: margenInicioBusqueda,
          lte: margenFinBusqueda,
        },
      },
    });

    if (funcionesSolapadas) {
      throw new ConflictException(
        'Solapamiento de horarios detectado. Existe otra función activa en esta sala dentro del rango de 2 horas.',
      );
    }

    const salaConAsientos = await this.prisma.salas.findUnique({
      where: { id: BigInt(createFuncionDto.id_sala) },
      include: { asientos: true },
    });

    if (!salaConAsientos) {
      throw new NotFoundException(`La sala con ID ${createFuncionDto.id_sala} no existe.`);
    }

    const nuevaFuncion = await this.prisma.$transaction(async (tx) => {
      const funcion = await tx.funciones.create({
        data: {
          id_pelicula: BigInt(createFuncionDto.id_pelicula),
          id_sala: BigInt(createFuncionDto.id_sala),
          fecha_hora: fechaInicioNueva,
          estado: 'DISPONIBLE', // 🌟 CAMBIO: Forzado a nacer por defecto como 'DISPONIBLE'
        },
      });

      if (salaConAsientos.asientos.length > 0) {
        const registrosAsientosFuncion = salaConAsientos.asientos.map((asiento) => ({
          id_asiento: asiento.id,
          id_funcion: funcion.id,
          estado: 'DISPONIBLE',
          id_usuario: null,
          version: 1,
        }));

        await tx.asientosFuncion.createMany({
          data: registrosAsientosFuncion,
        });
      }

      await tx.auditLog.create({
        data: {
          id_usuario: BigInt(auditorId),
          id_auditor: BigInt(auditorId),
          accion: 'FUNCION_CREADA',
          detalle: `Función creada para película ${createFuncionDto.id_pelicula} en sala ${createFuncionDto.id_sala} el ${fechaInicioNueva.toISOString()}`,
        },
      });

      return funcion;
    });

    return this.serializeFuncion(nuevaFuncion);
  }

  async findAll() {
    const funciones = await this.prisma.funciones.findMany({
      include: { 
        peliculas: true, 
        salas: {
          include: {
            cines: true
          }
        } 
      },
    });
    return funciones.map((f) => this.serializeFuncion(f));
  }

  async findOne(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: { peliculas: true, salas: true },
    });
    if (!funcion) throw new NotFoundException(`La función con ID ${id} no existe.`);
    return this.serializeFuncion(funcion);
  }

  async update(id: number, updateFuncionDto: UpdateFuncionDto, auditorId: number) {
    const fActual = await this.prisma.funciones.findUnique({ where: { id: BigInt(id) } });
    if (!fActual) throw new NotFoundException(`La función con ID ${id} no existe.`);

    // 🌟 NUEVA VALIDACIÓN: Si la función ya está CANCELADA, congelarla por completo
    if (fActual.estado === 'CANCELADA') {
      throw new BadRequestException('Esta función ya está cancelada y no se permite ninguna modificación.');
    }

    // 🌟 NUEVA VALIDACIÓN: Si envían una nueva fecha, asegurar que sea en el futuro
    const ahora = new Date();
    if (updateFuncionDto.fecha_hora) {
      const nuevaFechaSolicitada = new Date(updateFuncionDto.fecha_hora);
      if (nuevaFechaSolicitada <= ahora) {
        throw new BadRequestException('No puedes actualizar una función a una fecha u hora pasada.');
      }
    }

    const tieneReservas = await this.prisma.reservas.findFirst({
      where: {
        id_funcion: BigInt(id),
        estado: { in: ['CONFIRMADA', 'PENDIENTE_DE_PAGO'] },
      },
    });

    if (tieneReservas) {
      throw new BadRequestException(
        'No se puede modificar la función porque ya existen usuarios con reservaciones activas para esta función.',
      );
    }

    const nuevaSalaId = updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : fActual.id_sala;
    const nuevaFecha = updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : fActual.fecha_hora;

    const DURACION_PELICULA_MS = 120 * 60 * 1000;
    const conflicto = await this.prisma.funciones.findFirst({
      where: {
        id_sala: nuevaSalaId,
        id: { not: BigInt(id) },
        estado: { not: 'CANCELADA' },
        fecha_hora: {
          gte: new Date(nuevaFecha.getTime() - DURACION_PELICULA_MS),
          lte: new Date(nuevaFecha.getTime() + DURACION_PELICULA_MS),
        },
      },
    });

    if (conflicto) {
      throw new ConflictException('La nueva fecha u hora entra en conflicto con otra función programada.');
    }

    const actualizada = await this.prisma.$transaction(async (tx) => {
      if (updateFuncionDto.id_sala && BigInt(updateFuncionDto.id_sala) !== fActual.id_sala) {
        const nuevaSalaConAsientos = await tx.salas.findUnique({
          where: { id: BigInt(updateFuncionDto.id_sala) },
          include: { asientos: true },
        });

        if (!nuevaSalaConAsientos) {
          throw new NotFoundException(`La nueva sala con ID ${updateFuncionDto.id_sala} no existe.`);
        }

        await tx.asientosFuncion.deleteMany({
          where: { id_funcion: BigInt(id) },
        });

        if (nuevaSalaConAsientos.asientos.length > 0) {
          const nuevosAsientosFuncion = nuevaSalaConAsientos.asientos.map((asiento) => ({
            id_asiento: asiento.id,
            id_funcion: BigInt(id),
            estado: 'DISPONIBLE',
            id_usuario: null,
            version: 1,
          }));

          await tx.asientosFuncion.createMany({
            data: nuevosAsientosFuncion,
          });
        }
      }

      const funcion = await tx.funciones.update({
        where: { id: BigInt(id) },
        data: {
          id_pelicula: updateFuncionDto.id_pelicula ? BigInt(updateFuncionDto.id_pelicula) : undefined,
          id_sala: updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : undefined,
          fecha_hora: updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          id_usuario: BigInt(auditorId),
          id_auditor: BigInt(auditorId),
          accion: 'FUNCION_ACTUALIZADA',
          detalle: `Función ${id} actualizada`,
        },
      });

      return funcion;
    });

    return this.serializeFuncion(actualizada);
  }

  async cancelar(id: number, auditorId: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        peliculas: true,
        salas: { include: { cines: true } },
        reservas: {
          where: { estado: { not: 'CANCELADA' } },
          include: { usuarios: true, pagos: true },
        },
      },
    });

    if (!funcion) {
      throw new NotFoundException(`La función con ID ${id} no existe.`);
    }

    if (funcion.estado === 'CANCELADA') {
      throw new BadRequestException('La función ya se encuentra cancelada.');
    }

    // 🌟 NUEVA VALIDACIÓN: Impedir cancelación si la función ya pasó
    const ahora = new Date();
    const fechaFuncion = new Date(funcion.fecha_hora);
    if (ahora >= fechaFuncion) {
      throw new BadRequestException('No se puede cancelar una función que ya comenzó o finalizó.');
    }

    // Procesar reembolsos automáticos y notificar
    let reembolsados = 0;
    let notificados = 0;

    for (const reserva of funcion.reservas) {
      // Tomamos el primer pago si existe, asumiendo una relación 1:1 o que el primero es el válido
      const pago = reserva.pagos && reserva.pagos.length > 0 ? reserva.pagos[0] : null;
      let reembolsoRealizado: any = null; // Cambio a any para permitir la asignación

      if (pago && pago.estado === 'APROBADO') {
        try {
          // Registrar reembolso automático
          reembolsoRealizado = await this.prisma.reembolsos.create({
            data: {
              id_pago: pago.id,
              monto: pago.monto_final,
              estado: 'PROCESADO',
              fecha_procesado: new Date(),
            },
          });
          await this.prisma.pagos.update({
            where: { id: pago.id },
            data: { estado: 'REEMBOLSADO' },
          });
          reembolsados++;
        } catch (error) {
          console.error(`Error al procesar reembolso automático para reserva ${reserva.id}:`, error);
        }
      }

      // Notificar al usuario sobre la cancelación
      try {
        await this.mailService.sendEmail({
          to: reserva.usuarios.email,
          subject: 'Funcion cancelada',
          html: buildCancelledFunctionTemplate({
            reservationNumber: reserva.numero_reserva,
            movieTitle: funcion.peliculas.titulo,
            cinemaName: funcion.salas.cines.nombre,
            functionDate: funcion.fecha_hora,
            refundInstructions: reembolsoRealizado ? 'Espera a que se procese tu reembolso de acuerdo con las políticas del cine.' : 'Espera a que el personal del cine procese tu reembolso.',
          }),
        });
        notificados++;
      } catch (error) {
        console.error(`No se pudo enviar email de funcion cancelada a reserva ${reserva.id}.`, error);
      }

      // Notificar reembolso si se realizó
      if (reembolsoRealizado && pago) { // Verificación segura de pago
        try {
          await this.mailService.sendEmail({
            to: reserva.usuarios.email,
            subject: 'Notificación de Reembolso',
            html: buildCashRefundNotificationTemplate({
              paymentId: pago.id.toString(),
              reservationNumber: reserva.numero_reserva,
              customerName: reserva.usuarios.nombre,
              customerEmail: reserva.usuarios.email,
              amount: reembolsoRealizado.monto.toString(),
              note: 'Reembolso generado por cancelación de función.'
            }),
          });
        } catch (error) {
          console.error(`No se pudo enviar email de reembolso para la reserva ${reserva.id}.`, error);
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.funciones.update({
        where: { id: BigInt(id) },
        data: { estado: 'CANCELADA' },
      });

      await tx.reservas.updateMany({
        where: { id_funcion: BigInt(id), estado: { not: 'CANCELADA' } },
        data: { estado: 'CANCELADA' },
      });

      await tx.asientosFuncion.updateMany({
        where: { id_funcion: BigInt(id) },
        data: { estado: 'DISPONIBLE', id_usuario: null },
      });

      await tx.auditLog.create({
        data: {
          id_usuario: BigInt(auditorId),
          id_auditor: BigInt(auditorId),
          accion: 'FUNCION_CANCELADA_Y_REEMBOLSADA',
          detalle: `Función ${id} cancelada. Reservas afectadas: ${funcion.reservas.length}. Reembolsos automáticos: ${reembolsados}`,
        },
      });
    });

    return {
      message: 'Función cancelada y reembolsos procesados exitosamente.',
      idFuncion: id,
      reservas_afectadas: funcion.reservas.length,
      reembolsos_automaticos: reembolsados,
      emails_enviados: notificados,
    };
  }

  async notifyCancelledFunctionReservations(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        peliculas: true,
        salas: {
          include: {
            cines: true,
          },
        },
        reservas: {
          where: {
            estado: { not: 'CANCELADA' },
          },
          include: {
            usuarios: true,
          },
        },
      },
    });

    if (!funcion) {
      throw new NotFoundException(`La función con ID ${id} no existe.`);
    }

    let enviados = 0;

    for (const reserva of funcion.reservas) {
      try {
        await this.mailService.sendEmail({
          to: reserva.usuarios.email,
          subject: 'Funcion cancelada',
          html: buildCancelledFunctionTemplate({
            reservationNumber: reserva.numero_reserva,
            movieTitle: funcion.peliculas.titulo,
            cinemaName: funcion.salas.cines.nombre,
            functionDate: funcion.fecha_hora,
            refundInstructions:
              'Conserva tu numero de reserva. El personal del cine te indicara el proceso de reembolso.',
          }),
        });
        enviados += 1;
      } catch (error) {
        console.error(`No se pudo enviar email de funcion cancelada a reserva ${reserva.id}.`, error);
      }
    }

    return {
      message: 'Notificaciones de funcion cancelada procesadas',
      reservas_afectadas: funcion.reservas.length,
      emails_enviados: enviados,
    };
  }

  async remove(id: number, auditorId: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: { reservas: true },
    });

    if (!funcion) {
      throw new NotFoundException(`La función con ID ${id} no existe.`);
    }

    // 🌟 REGLAS DE NEGOCIO:
    // 1. No se puede eliminar si ya fue cancelada
    if (funcion.estado === 'CANCELADA') {
      throw new BadRequestException('No se puede eliminar una función que ya ha sido cancelada.');
    }

    // 2. No se puede eliminar si hay reservas activas
    const tieneReservas = funcion.reservas.some(
      (reserva) => reserva.estado !== 'CANCELADA',
    );

    if (tieneReservas) {
      throw new BadRequestException(
        'No se puede eliminar la función porque existen reservaciones activas vinculadas.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Eliminar asientos_funcion asociados
        await tx.asientosFuncion.deleteMany({ where: { id_funcion: BigInt(id) } });

        // Eliminar la función
        await tx.funciones.delete({ where: { id: BigInt(id) } });

        // Registrar auditoría
        await tx.auditLog.create({
          data: {
            id_usuario: BigInt(auditorId),
            id_auditor: BigInt(auditorId),
            accion: 'FUNCION_ELIMINADA',
            detalle: `Función ${id} eliminada permanentemente por reglas de negocio validadas.`,
          },
        });
      });

      return { message: `Función con ID ${id} borrada definitivamente.` };
    } catch (error) {
      console.error(error);
      throw new ConflictException('No se pudo eliminar la función debido a un error en el servidor.');
    }
  }

  async getMapaAsientos(idFuncion: number) {
    await this.findOne(idFuncion);

    const asientosFuncion = await this.prisma.asientosFuncion.findMany({
      where: { id_funcion: BigInt(idFuncion) },
      include: {
        asientos: true,
      },
      orderBy: [
        { asientos: { fila: 'asc' } },
        { asientos: { columna: 'asc' } },
      ],
    });

    const ahora = new Date();

    return asientosFuncion.map((af) => {
      let estadoReal = af.estado;

      if (af.estado === 'BLOQUEADO' && af.bloqueado_hasta && af.bloqueado_hasta < ahora) {
        estadoReal = 'DISPONIBLE';
      }

      return {
        id_asiento_funcion: Number(af.id),
        id_asiento_fisico: Number(af.id_asiento),
        fila: af.asientos.fila.trim(),
        columna: af.asientos.columna,
        codigo: af.asientos.codigo,
        tipo: af.asientos.tipo,
        estado: estadoReal,
        id_usuario: af.id_usuario ? Number(af.id_usuario) : null,
        bloqueado_hasta: af.bloqueado_hasta,
      };
    });
  }

  async bloquearAsientos(idFuncion: number, userId: number, dto: BloquearAsientosDto) {
    const { asientosFuncionIds, minutosExpiracion } = dto;
    const minutos = minutosExpiracion || 5;
    const fechaExpiracion = new Date(Date.now() + minutos * 60 * 1000);
    const ahora = new Date();

    await this.prisma.$transaction(async (tx) => {
      for (const afId of asientosFuncionIds) {
        const af = await tx.asientosFuncion.findUnique({
          where: { id: BigInt(afId) },
        });

        if (!af) {
          throw new NotFoundException(`El asiento-función con ID ${afId} no existe.`);
        }

        if (af.estado === 'MANTENIMIENTO' || af.estado === 'NO_DISPONIBLE') {
          throw new ConflictException(`El asiento con ID ${afId} está temporalmente fuera de servicio por mantenimiento.`);
        }

        if (Number(af.id_funcion) !== idFuncion) {
          throw new BadRequestException(`El asiento ${afId} no pertenece a la función ${idFuncion}.`);
        }

        if (af.estado === 'OCUPADO' || af.estado === 'PENDIENTE_DE_PAGO') {
          throw new ConflictException(`El asiento con ID ${afId} ya no se encuentra disponible.`);
        }

        if (
          af.estado === 'BLOQUEADO' &&
          af.bloqueado_hasta &&
          af.bloqueado_hasta >= ahora &&
          Number(af.id_usuario) !== userId
        ) {
          throw new ConflictException(`El asiento con ID ${afId} está reservado temporalmente por otro cliente.`);
        }
      }

      await tx.asientosFuncion.updateMany({
        where: { id: { in: asientosFuncionIds.map((id) => BigInt(id)) } },
        data: {
          estado: 'BLOQUEADO',
          id_usuario: BigInt(userId),
          bloqueado_hasta: fechaExpiracion,
        },
      });
    });

    return {
      message: `Asientos bloqueados exitosamente por ${minutos} minutos.`,
      asientosAfectados: asientosFuncionIds,
      expira_at: fechaExpiracion,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMarcarFuncionesFinalizadas() {
    const ahora = new Date();

    const actualizadas = await this.prisma.funciones.updateMany({
      where: {
        fecha_hora: { lt: ahora },
        estado: { in: ['DISPONIBLE', 'AGOTADO'] },
      },
      data: {
        estado: 'FINALIZADA',
      },
    });

    if (actualizadas.count > 0) {
      console.log(`[CRON JOB] Se marcaron ${actualizadas.count} funciones como FINALIZADA.`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleLiberarBloqueosExpirados() {
    const ahora = new Date();

    const liberados = await this.prisma.asientosFuncion.updateMany({
      where: {
        estado: 'BLOQUEADO',
        bloqueado_hasta: { lt: ahora },
      },
      data: {
        estado: 'DISPONIBLE',
        id_usuario: null,
      },
    });

    if (liberados.count > 0) {
      console.log(`[CRON JOB] Se liberaron de forma automática ${liberados.count} asientos expirados.`);
    }
  }
}
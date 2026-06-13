import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionDto } from './create-funciones.dto';
import { UpdateFuncionDto } from './update-funciones.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BloquearAsientosDto } from './bloquear-asientos.dto';
import { MailService } from '../mail/mail.service';
import { buildCancelledFunctionTemplate } from '../mail/templates/cancelled-function.template';

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

  async create(createFuncionDto: CreateFuncionDto) {
    const fechaInicioNueva = new Date(createFuncionDto.fecha_hora);
    
    const DURACION_PELICULA_MS = 120 * 60 * 1000; 
    const fechaFinNueva = new Date(fechaInicioNueva.getTime() + DURACION_PELICULA_MS);

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
      include: { asientos: true }
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
          estado: createFuncionDto.estado || 'DISPONIBLE',
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

      return funcion;
    });

    return this.serializeFuncion(nuevaFuncion);
  }
  async findAll() {
    const funciones = await this.prisma.funciones.findMany({
      include: { peliculas: true, salas: true },
    });
    return funciones.map(f => this.serializeFuncion(f));
  }

  async findOne(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: { peliculas: true, salas: true },
    });
    if (!funcion) throw new NotFoundException(`La función con ID ${id} no existe.`);
    return this.serializeFuncion(funcion);
  }

async update(id: number, updateFuncionDto: UpdateFuncionDto) {
    await this.findOne(id);

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

    const fActual = await this.prisma.funciones.findUnique({ where: { id: BigInt(id) } });
    const nuevaSalaId = updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : fActual!.id_sala;
    const nuevaFecha = updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : fActual!.fecha_hora;

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
      
      if (updateFuncionDto.id_sala && BigInt(updateFuncionDto.id_sala) !== fActual!.id_sala) {
        
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

      return await tx.funciones.update({
        where: { id: BigInt(id) },
        data: {
          id_pelicula: updateFuncionDto.id_pelicula ? BigInt(updateFuncionDto.id_pelicula) : undefined,
          id_sala: updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : undefined,
          fecha_hora: updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : undefined,
          estado: updateFuncionDto.estado,
        },
      });
    });

    return this.serializeFuncion(actualizada);
  }

  async cancelar(id: number) {
   
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
      throw new NotFoundException(`La funciÃ³n con ID ${id} no existe.`);
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

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.prisma.funciones.delete({ where: { id: BigInt(id) } });
      return { message: `Función con ID ${id} borrada definitivamente.` };
    } catch {
      throw new ConflictException('No se puede eliminar físicamente; contiene dependencias de transacciones.');
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
    const minutos = minutosExpiracion || 5; // Por defecto 5 minutos
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
        where: { id: { in: asientosFuncionIds.map(id => BigInt(id)) } },
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

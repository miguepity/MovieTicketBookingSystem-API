import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './create-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

  async createReserva(createReservaDto: CreateReservaDto, userId: number) {
    const { id_funcion, asientosFuncionIds } = createReservaDto;

    const numeroUnicoReserva = `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const ahora = new Date();

    const nuevaReserva = await this.prisma.$transaction(async (tx) => {
      
      for (const afId of asientosFuncionIds) {
        
        const asientoFuncion = await tx.asientosFuncion.findUnique({
          where: { id: BigInt(afId) },
        });

        if (!asientoFuncion) {
          throw new NotFoundException(`El asiento-función con ID ${afId} no existe.`);
        }

        if (Number(asientoFuncion.id_funcion) !== id_funcion) {
          throw new BadRequestException(
            `El asiento con ID ${afId} no pertenece a la función ${id_funcion} (pertenece a la función ${asientoFuncion.id_funcion}).`
          );
        }       

        if (asientoFuncion.estado === 'OCUPADO' || asientoFuncion.estado === 'PENDIENTE_DE_PAGO') {
          throw new ConflictException(`El asiento con ID ${afId} ya no se encuentra disponible.`);
        }

        if (
          asientoFuncion.estado === 'BLOQUEADO' && 
          asientoFuncion.bloqueado_hasta && 
          asientoFuncion.bloqueado_hasta >= ahora && 
          Number(asientoFuncion.id_usuario) !== userId 
        ) {
          throw new ConflictException(`El asiento con ID ${afId} está reservado temporalmente en el carrito de otro cliente.`);
        }
      }

      const reserva = await tx.reservas.create({
        data: {
          numero_reserva: numeroUnicoReserva,
          id_usuario: BigInt(userId),
          id_funcion: BigInt(id_funcion),
          estado: 'PENDIENTE_DE_PAGO',
        },
      });

      const registrosIntermedios = asientosFuncionIds.map((afId) => ({
        id_reserva: reserva.id,
        id_asiento_funcion: BigInt(afId),
      }));
      await tx.reservaAsientos.createMany({ data: registrosIntermedios });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: asientosFuncionIds.map(id => BigInt(id)) } },
        data: { 
          estado: 'PENDIENTE_DE_PAGO',
          id_usuario: BigInt(userId) 
        },
      });

      return reserva;
    });

    return {
      message: 'Reserva generada con éxito en estado pendiente de pago.',
      reservaId: Number(nuevaReserva.id),
      codigoTicket: nuevaReserva.numero_reserva,
      estado: nuevaReserva.estado,
    };
  }

async findAll(userId: number, userRole: string) {
  const filtro = userRole === 'ADMIN' ? {} : { id_usuario: BigInt(userId) };

  return await this.prisma.reservas.findMany({
    where: filtro,
    include: {
      funciones: {
        include: { peliculas: true } 
      },
      reservaAsientos: {
        include: {
          asientosfuncion: {
            include: { asientos: true } 
          }
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });
}

async findOne(id: number, userId: number, userRole: string) {
  const reserva = await this.prisma.reservas.findUnique({
    where: { id: BigInt(id) },
    include: {
      funciones: { include: { peliculas: true } },
      reservaAsientos: {
        include: { asientosfuncion: { include: { asientos: true } } }
      }
    }
  });

  if (!reserva) throw new NotFoundException(`La reserva con ID ${id} no existe.`);

  if (userRole !== 'ADMIN' && Number(reserva.id_usuario) !== userId) {
    throw new ForbiddenException('No tienes permiso para ver esta reserva.');
  }

  return reserva;
}

  async cancelarReserva(idReserva: number) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(idReserva) },
      include: { 
        funciones: true,
        reservaAsientos: true 
      },
    });

    if (!reserva) throw new NotFoundException(`La reserva con ID ${idReserva} no existe.`);
    if (reserva.estado === 'CANCELADA') throw new BadRequestException('Esta reserva ya se encuentra cancelada.');

    const ahora = new Date();
    const horaFuncion = new Date(reserva.funciones.fecha_hora);
    const diferenciaHoras = (horaFuncion.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (diferenciaHoras < 2) {
      throw new BadRequestException(
        'Política de cancelación infringida: No se admiten cancelaciones con menos de 2 horas de anticipación.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reservas.update({
        where: { id: BigInt(idReserva) },
        data: { estado: 'CANCELADA' },
      });

      const asientosAFacilitar = reserva.reservaAsientos.map(ra => ra.id_asiento_funcion);

      if (asientosAFacilitar.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: asientosAFacilitar } },
          data: { 
            estado: 'DISPONIBLE',
            id_usuario: null 
          },
        });
      }
    });

    return {
      message: 'Reserva cancelada exitosamente. Los asientos han sido reabiertos al público.',
      idReserva,
      nuevoEstado: 'CANCELADA'
    };
  }
}
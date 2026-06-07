import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class FuncionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async cancelarFuncion(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: { peliculas: true },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');
    if (funcion.estado === 'cancelada')
      throw new BadRequestException('La función ya está cancelada');

    // 1. Identificar reservas activas antes de cancelar
    const reservasAfectadas = await this.prisma.reservas.findMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      include: {
        usuarios: {
          select: { nombre: true, email: true },
        },
      },
    });

    // 2. Cancelar la función
    await this.prisma.funciones.update({
      where: { id: BigInt(id) },
      data: { estado: 'cancelada' },
    });

    // 3. Cancelar todas las reservas activas de la función
    await this.prisma.reservas.updateMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      data: { estado: 'cancelada' },
    });

    // 4. Envío masivo de emails — Promise.allSettled para no abortar si uno falla
    const resultadosEmail = await Promise.allSettled(
      reservasAfectadas.map((reserva) =>
        this.emailService.sendCancelacionFuncion(
          reserva.usuarios.email,
          reserva.usuarios.nombre,
          funcion.peliculas.titulo,
          funcion.fecha_hora,
          reserva.numero_reserva,
        ),
      ),
    );

    const emailsEnviados = resultadosEmail.filter(
      (r) => r.status === 'fulfilled',
    ).length;
    const emailsFallidos = resultadosEmail.filter(
      (r) => r.status === 'rejected',
    ).length;

    return {
      message: 'Función cancelada exitosamente',
      reservas_afectadas: reservasAfectadas.length,
      emails_enviados: emailsEnviados,
      emails_fallidos: emailsFallidos,
    };
  }

  async getReservasActivasByFuncion(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.reservas.findMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      include: {
        usuarios: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
  }
}

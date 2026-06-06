import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionDto } from './create-funciones.dto';
import { UpdateFuncionDto } from './update-funciones.dto';

@Injectable()
export class FuncionesService {
  constructor(private readonly prisma: PrismaService) {}

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

    const nuevaFuncion = await this.prisma.funciones.create({
      data: {
        id_pelicula: BigInt(createFuncionDto.id_pelicula),
        id_sala: BigInt(createFuncionDto.id_sala),
        fecha_hora: fechaInicioNueva,
        estado: createFuncionDto.estado || 'DISPONIBLE',
      },
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
        estado: { in: ['CONFIRMADA', 'PENDIENTE'] },
      },
    });

    if (tieneReservas) {
      throw new BadRequestException(
        'No se puede modificar la función porque ya existen usuarios con reservaciones activas para esta función.',
      );
    }

    if (updateFuncionDto.fecha_hora || updateFuncionDto.id_sala) {
      const fActual = await this.prisma.funciones.findUnique({ where: { id: BigInt(id) } });
      const salaId = updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : fActual!.id_sala;
      const nuevaFecha = updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : fActual!.fecha_hora;

      const DURACION_PELICULA_MS = 120 * 60 * 1000;
      const conflicto = await this.prisma.funciones.findFirst({
        where: {
          id_sala: salaId,
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
    }

    const actualizada = await this.prisma.funciones.update({
      where: { id: BigInt(id) },
      data: {
        id_pelicula: updateFuncionDto.id_pelicula ? BigInt(updateFuncionDto.id_pelicula) : undefined,
        id_sala: updateFuncionDto.id_sala ? BigInt(updateFuncionDto.id_sala) : undefined,
        fecha_hora: updateFuncionDto.fecha_hora ? new Date(updateFuncionDto.fecha_hora) : undefined,
        estado: updateFuncionDto.estado,
      },
    });

    return this.serializeFuncion(actualizada);
  }

  async cancelar(id: number) {
   
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
}
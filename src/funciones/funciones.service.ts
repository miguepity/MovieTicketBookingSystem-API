import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';

@Injectable()
export class FuncionesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFuncionDto: CreateFuncionDto) {
    return this.prisma.funciones.create({
      data: {
        id_pelicula: createFuncionDto.id_pelicula,
        id_sala: createFuncionDto.id_sala,
        fecha_hora: new Date(createFuncionDto.fecha_hora),
        estado: createFuncionDto.estado,
      },
    });
  }

  async update(id: number, updateFuncionDto: UpdateFuncionDto) {
    const funcion = await this.prisma.funciones.findUnique({ where: { id } });
    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.funciones.update({
      where: { id },
      data: {
        ...(updateFuncionDto.id_pelicula !== undefined && { id_pelicula: updateFuncionDto.id_pelicula }),
        ...(updateFuncionDto.id_sala !== undefined && { id_sala: updateFuncionDto.id_sala }),
        ...(updateFuncionDto.fecha_hora !== undefined && { fecha_hora: new Date(updateFuncionDto.fecha_hora) }),
        ...(updateFuncionDto.estado !== undefined && { estado: updateFuncionDto.estado }),
      },
    });
  }

  async cancel(id: number) {
    const funcion = await this.prisma.funciones.findUnique({ where: { id } });
    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.funciones.update({
      where: { id },
      data: { estado: 'cancelada' },
    });
  }
}

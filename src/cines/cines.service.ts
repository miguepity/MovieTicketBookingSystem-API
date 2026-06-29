import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCineDto } from './dto/cine.body.dto';
import { EditBodyDto } from './dto/cine.edit.dto';
import { ParamDto } from './dto/cine.param.dto';

@Injectable()
export class CineService {
  constructor(private readonly prisma: PrismaService) {}

  async createCine(dto: CreateCineDto) {
    const findCity = await this.prisma.ciudades.findFirst({
      where: { id: dto.id_ciudad },
    });
    if (!findCity) {
      throw new NotFoundException('City not Found');
    }
    const newCine = await this.prisma.cines.create({
      data: dto,
    });
    return newCine;
  }

  async findAll() {
    return this.prisma.cines.findMany({
      include: {
        _count: {
          select: { salas: true },
        },
      },
    });
  }

  async editCine(dtoP: ParamDto, dtoB: EditBodyDto) {
    const findCinema = await this.prisma.cines.findFirst({
      where: { id: dtoP.id },
    });
    if (!findCinema) {
      throw new NotFoundException('Cinema not Found');
    }
    return this.prisma.cines.update({
      where: { id: dtoP.id },
      data: dtoB,
    });
  }

  async deleteCine(id: number) {
    const findCinema = await this.prisma.cines.findUnique({
      where: { id },
    });
    if (!findCinema) {
      throw new NotFoundException('Cinema not Found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Find all salas in this cinema
      const salas = await tx.salas.findMany({
        where: { id_cine: BigInt(id) },
      });

      // 2. Delete asientos for all found salas
      for (const sala of salas) {
        await tx.asientos.deleteMany({
          where: { id_sala: sala.id },
        });
      }

      // 3. Delete all salas in this cinema
      await tx.salas.deleteMany({
        where: { id_cine: BigInt(id) },
      });

      // 4. Finally delete the cine
      return await tx.cines.delete({
        where: { id },
      });
    });
  }

  async getFuncionesDisponibles(id_cine: number) {
    const cine = await this.prisma.cines.findUnique({ where: { id: id_cine } });
    if (!cine) throw new NotFoundException('Cinema not Found');

    return this.prisma.funciones.findMany({
      where: {
        salas: { id_cine },
        fecha_hora: { gte: new Date() },
        estado: { not: 'cancelada' },
      },
      include: {
        peliculas: true,
        salas: true,
      },
    });
  }
}

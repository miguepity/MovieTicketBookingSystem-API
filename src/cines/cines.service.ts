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
    return this.prisma.cines.findMany();
  }

  async editCine(dtoP: ParamDto, dtoB: EditBodyDto) {
    const findCinema = await this.prisma.cines.findFirst({
      where: { id: dtoP.id },
    });
    if (!findCinema) {
      throw new NotFoundException('Cinema not Found');
    }
    await this.prisma.cines.update({
      where: { id: dtoP.id },
      data: dtoB,
    });
    return 'Cinema edited succesfully';
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateSala(idCine: number, dto: CreateSalaDto) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(idCine) },
    });

    if (!cine) {
      throw new NotFoundException('Cine no encontrado');
    }

    const sala = await this.prisma.salas.create({
      data: {
        nombre: dto.nombre,
        filas: dto.fila,
        columnas: dto.columna,
        id_cine: BigInt(idCine),
      },
      select: {
        id: true,
        nombre: true,
        filas: true,
        columnas: true,
        id_cine: true,
      },
    });

    return sala;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalaDto: CreateSalaDto) {
    const { nombre, id_cine, filas, columnas } = createSalaDto;

    const cineExistente = await this.prisma.cines.findUnique({
      where: { id: BigInt(id_cine) },
    });

    if (!cineExistente) {
      throw new NotFoundException(`Cine con ID ${id_cine} no encontrado`);
    }

    const sala = await this.prisma.salas.create({
      data: {
        nombre,
        id_cine: BigInt(id_cine),
        filas,
        columnas,
      },
    });

    return this.mapSala(sala);
  }

  async update(id: number, updateSalaDto: UpdateSalaDto) {
    const salaExistente = await this.prisma.salas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!salaExistente) {
      throw new NotFoundException(`Sala con ID ${id} no encontrada`);
    }

    if (updateSalaDto.id_cine !== undefined) {
      const cineExistente = await this.prisma.cines.findUnique({
        where: { id: BigInt(updateSalaDto.id_cine) },
      });

      if (!cineExistente) {
        throw new NotFoundException(
          `Cine con ID ${updateSalaDto.id_cine} no encontrado`,
        );
      }
    }

    const dataAActualizar: any = { ...updateSalaDto };
    if (dataAActualizar.id_cine !== undefined) {
      dataAActualizar.id_cine = BigInt(dataAActualizar.id_cine);
    }

    const salaActualizada = await this.prisma.salas.update({
      where: { id: BigInt(id) },
      data: dataAActualizar,
    });

    return this.mapSala(salaActualizada);
  }

  private mapSala(sala: any) {
    return {
      ...sala,
      id: sala.id.toString(),
      id_cine: sala.id_cine.toString(),
    };
  }
}

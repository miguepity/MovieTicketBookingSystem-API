import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

    const sala = await this.prisma.$transaction(async (tx) => {
      const nuevaSala = await tx.salas.create({
        data: {
          nombre,
          id_cine: BigInt(id_cine),
          filas,
          columnas,
        },
      });

      const asientosData: {
        id_sala: bigint;
        fila: string;
        columna: number;
        codigo: string;
        tipo: string;
      }[] = [];

      for (let f = 0; f < filas; f++) {
        const filaLetra = String.fromCharCode(65 + f);
        for (let c = 1; c <= columnas; c++) {
          asientosData.push({
            id_sala: nuevaSala.id,
            fila: filaLetra,
            columna: c,
            codigo: `${filaLetra}${c}`,
            tipo: 'NORMAL',
          });
        }
      }

      await tx.asientos.createMany({
        data: asientosData,
      });

      return nuevaSala;
    });
    return this.serializeSala(sala);
  }

  async findAll() {
    const salas = await this.prisma.salas.findMany({
      include: {
        cines: true,
      },
    });

    return salas.map((sala) => this.serializeSala(sala));
  }

  async findOne(id: number) {
    const sala = await this.prisma.salas.findUnique({
      where: { id: BigInt(id) },
      include: {
        cines: true,
      },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con ID ${id} no encontrada`);
    }

    return this.serializeSala(sala);
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

    return this.serializeSala(salaActualizada);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.asientos.deleteMany({
          where: { id_sala: BigInt(id) },
        });
        await tx.salas.delete({
          where: { id: BigInt(id) },
        });
      });

      return { message: `Sala con ID ${id} eliminada exitosamente` };
    } catch {
      throw new ConflictException(
        'No se puede eliminar la sala porque tiene funciones u otros registros asociados.',
      );
    }
  }

  private serializeSala(sala: any) {
    if (!sala) return sala;

    const serialized: any = {
      ...sala,
      id: Number(sala.id),
      id_cine: Number(sala.id_cine),
    };

    if (sala.cines) {
      serialized.cines = {
        ...sala.cines,
        id: Number(sala.cines.id),
        id_ciudad: Number(sala.cines.id_ciudad),
      };
    }

    return serialized;
  }
}

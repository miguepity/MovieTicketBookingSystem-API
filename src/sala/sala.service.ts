import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { Prisma } from '@prisma/client';

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
    const { id_cine, filas, columnas, ...restoDatos } = updateSalaDto;
    const salaIdBigInt = BigInt(id);

    const salaExistente = await this.prisma.salas.findUnique({
      where: { id: salaIdBigInt },
    });

    if (!salaExistente) {
      throw new NotFoundException(`Sala con ID ${id} no encontrada`);
    }

    if (id_cine !== undefined) {
      const cineExistente = await this.prisma.cines.findUnique({
        where: { id: BigInt(id_cine) },
      });
      if (!cineExistente) {
        throw new NotFoundException(`Cine con ID ${id_cine} no encontrado`);
      }
    }

    const cambianDimensiones = 
      (filas !== undefined && filas !== salaExistente.filas) || 
      (columnas !== undefined && columnas !== salaExistente.columnas);

    const salaActualizada = await this.prisma.$transaction(async (tx) => {
      
      const dataAActualizar: any = { 
        ...restoDatos,
        ...(id_cine !== undefined && { id_cine: BigInt(id_cine) }),
        ...(filas !== undefined && { filas }),
        ...(columnas !== undefined && { columnas }),
      };

      const sala = await tx.salas.update({
        where: { id: salaIdBigInt },
        data: dataAActualizar,
      });

      if (cambianDimensiones) {

      const tieneFuncionesAsignadas = await this.prisma.asientosFuncion.findFirst({
        where: {
          asientos: {
            id_sala: salaIdBigInt
          }
        }
      });

      if (tieneFuncionesAsignadas) {
        throw new BadRequestException(
          'No se pueden modificar las dimensiones de la sala porque ya existen funciones programadas con estos asientos.'
        );
      }
  
        await tx.asientos.deleteMany({
          where: { id_sala: salaIdBigInt },
        });

        const nuevosAsientos: Prisma.AsientosCreateManyInput[] = [];
        const totalFilas = filas ?? salaExistente.filas;
        const totalColumnas = columnas ?? salaExistente.columnas;

        for (let f = 1; f <= totalFilas; f++) {
          const letraFila = String.fromCharCode(64 + f); 

          for (let c = 1; c <= totalColumnas; c++) {
            nuevosAsientos.push({
              id_sala: salaIdBigInt,
              fila: letraFila,
              columna: c,
              codigo: `${letraFila}${c}`,
              tipo: 'ESTANDAR',
            });
          }
        }
        if (nuevosAsientos.length > 0) {
          await tx.asientos.createMany({
            data: nuevosAsientos,
          });
        }
      }

      return sala;
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

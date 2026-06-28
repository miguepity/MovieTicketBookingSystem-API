import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

const maxSalas = 20;

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async crearSala(idCine: number, dto: CreateSalaDto) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(idCine) },
    });

    if (!cine) {
      throw new NotFoundException(`Cine con id ${idCine} no encontrado`);
    }

    const totalSalas = await this.prisma.salas.count({
      where: { id_cine: BigInt(idCine) },
    });

    if (totalSalas >= maxSalas) {
      throw new UnprocessableEntityException(
        `El cine ya tiene el máximo de ${maxSalas} salas permitidas`,
      );
    }

    const salaExistente = await this.prisma.salas.findFirst({
      where: {
        nombre: dto.nombre,
        id_cine: BigInt(idCine),
      },
    });

    if (salaExistente) {
      throw new ConflictException(
        `Ya existe una sala con el nombre "${dto.nombre}" en este cine`,
      );
    }

    if (dto.filas < 1 || dto.filas > 26) {
      throw new UnprocessableEntityException(
        'El número de filas debe ser entre 1 y 26',
      );
    }

    if (dto.columnas < 1 || dto.columnas > 30) {
      throw new UnprocessableEntityException(
        'El número de columnas debe ser entre 1 y 30',
      );
    }

    const sala = await this.prisma.salas.create({
      data: {
        nombre: dto.nombre,
        filas: dto.filas,
        columnas: dto.columnas,
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

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const asientos: {
      id_sala: bigint;
      fila: string;
      columna: number;
      codigo: string;
      tipo: string;
    }[] = [];

    for (let fila = 0; fila < dto.filas; fila++) {
      for (let col = 1; col <= dto.columnas; col++) {
        const letraFila = letras[fila];
        asientos.push({
          id_sala: sala.id,
          fila: letraFila,
          columna: col,
          codigo: `${letraFila}${col}`,
          tipo: 'normal',
        });
      }
    }

    await this.prisma.asientos.createMany({ data: asientos });

    return {
      ...sala,
      asientos_generados: asientos.length,
    };
  }

  async getSala(id: number) {
    const sala = await this.prisma.salas.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nombre: true,
        filas: true,
        columnas: true,
        id_cine: true,
        asientos: {
          select: {
            id: true,
            fila: true,
            columna: true,
            codigo: true,
            id_sala: true,
          },
          orderBy: [{ fila: 'asc' }, { columna: 'asc' }],
        },
      },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con id ${id} no encontrada`);
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: BigInt(id),
        estado: 'active',
      },
    });

    return {
      ...sala,
      funciones_activas: funcionesActivas,
    };
  }

  async getSalas(idCine?: number) {
    const salas = await this.prisma.salas.findMany({
      where: idCine ? { id_cine: BigInt(idCine) } : {},
      select: {
        id: true,
        nombre: true,
        filas: true,
        columnas: true,
        id_cine: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return await Promise.all(
      salas.map(async (sala) => ({
        ...sala,
        funciones_activas: await this.prisma.funciones.count({
          where: {
            id_sala: sala.id,
            estado: 'active',
          },
        }),
      })),
    );
  }

  async update(id: number, dto: UpdateSalaDto) {
    const sala = await this.prisma.salas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con id ${id} no encontrada`);
    }

    if (dto.nombre) {
      const salaExistente = await this.prisma.salas.findFirst({
        where: {
          nombre: dto.nombre,
          id_cine: sala.id_cine,
          NOT: { id: BigInt(id) },
        },
      });

      if (salaExistente) {
        throw new ConflictException(
          `Ya existe una sala con el nombre "${dto.nombre}" en este cine`,
        );
      }
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: BigInt(id),
        estado: 'active',
      },
    });

    const salaActualizada = await this.prisma.salas.update({
      where: { id: BigInt(id) },
      data: {
        nombre: dto.nombre,
      },
      select: {
        id: true,
        nombre: true,
        filas: true,
        columnas: true,
        id_cine: true,
      },
    });

    return {
      ...salaActualizada,
      funciones_activas: funcionesActivas,
      ...(funcionesActivas > 0 && {
        advertencia: `Esta sala tiene ${funcionesActivas} funcion(es) activa(s)`,
      }),
    };
  }

  async delete(id: number) {
    const sala = await this.prisma.salas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con id ${id} no encontrada`);
    }

    await this.prisma.salas.delete({
      where: { id: BigInt(id) },
    });
  }
}

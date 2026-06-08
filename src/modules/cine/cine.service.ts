import { PrismaService } from '../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCineDto } from './dto/create-cine.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { ListCinesQueryDto } from './dto/list-cines-query.dto';
import { CinesPageResponseDto } from './dto/cines-page.response.dto';
import { CineListItemResponseDto } from './dto/cine-list-item.response.dto';
import { Prisma } from '../../../generated/prisma/client';

type CineListPayload = Prisma.CinesGetPayload<{
  include: {
    salas: {
      select: {
        id: true;
        nombre: true;
      };
    };
  };
}>;

@Injectable()
export class CineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCineDto: CreateCineDto): Promise<CineCreatedResponseDto> {
    const idCiudad = BigInt(createCineDto.id_ciudad);
    const city = await this.prisma.ciudades.findUnique({
      where: { id: idCiudad },
      select: { id: true },
    });
    if (!city) {
      throw new BadRequestException('Ciudad no existe');
    }

    const cine = await this.prisma.cines.create({
      data: {
        nombre: createCineDto.nombre,
        direccion: createCineDto.direccion,
        id_ciudad: idCiudad,
      },
      select: { id: true },
    });

    return { id: cine.id };
  }

  async findAll(query: ListCinesQueryDto): Promise<CinesPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const name = query.name?.trim();
    const where: Prisma.CinesWhereInput = {};

    if (name) {
      where.nombre = { contains: name, mode: 'insensitive' };
    }

    if (query.id_ciudad !== undefined) {
      where.id_ciudad = BigInt(query.id_ciudad);
    }

    const [total, cines] = await this.prisma.$transaction([
      this.prisma.cines.count({ where }),
      this.prisma.cines.findMany({
        where,
        include: {
          ciudades: { select: { id: true, nombre: true } },
          salas: {
            select: { id: true, nombre: true, filas: true, columnas: true },
          },
        },
        orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: cines.map((cine) => this.toListItem(cine)),
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateCineDto: UpdateCineDto) {
    const cineId = this.parseId(id);

    const existing = await this.prisma.cines.findUnique({
      where: { id: cineId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Cine no encontrado');
    }

    return this.prisma.cines.update({
      where: { id: cineId },
      data: {
        nombre: updateCineDto.nombre,
        direccion: updateCineDto.direccion,
      },
    });
  }

  async findOne(id: string) {
    const cineId = this.parseId(id);
    const cine = await this.prisma.cines.findUnique({
      where: { id: cineId },
    });
    if (!cine) throw new NotFoundException('Cine no encontrado');
    return cine;
  }

  async remove(id: string) {
    const cineId = this.parseId(id);
    const existing = await this.prisma.cines.findUnique({
      where: { id: cineId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Cine no encontrado');
    }
    try {
      return await this.prisma.cines.delete({ where: { id: cineId } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar: el cine tiene salas asociadas',
        );
      }
      throw e;
    }
  }

  private toListItem(cine: CineListPayload): CineListItemResponseDto {
    return {
      id: cine.id.toString(),
      nombre: cine.nombre,
      direccion: cine.direccion ?? null,
      id_ciudad: cine.id_ciudad.toString(),
      salas: cine.salas
        ? cine.salas.map((s: any) => ({
            id: s.id.toString(),
            nombre: s.nombre,
          }))
        : [],
      fecha_creacion: cine.created_at,
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}

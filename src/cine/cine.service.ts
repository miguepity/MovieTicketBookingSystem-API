
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCineDto } from './dto/create-cine.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

import { ListCinesQueryDto } from './dto/list-cines-query.dto';
import { CinesPageResponseDto } from './dto/cines-page.response.dto';
import { CineListItemResponseDto } from './dto/cine-list-item.response.dto';


@Injectable()
export class CineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCineDto: CreateCineDto): Promise<CineCreatedResponseDto> {
    const idCiudad = BigInt(createCineDto.id_ciudad);
    const city = await this.prisma.ciudades.findUnique({
      where: { id: idCiudad },
      select: { id: true},
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

  async findAll(
    query: ListCinesQueryDto
  ): Promise<CinesPageResponseDto> {
    let page = Number(query.page ?? 1);
    if (!Number.isInteger(page) || page < 1) page = 1;
    let limit = Number(query.limit ?? 20);
    if (!Number.isInteger(limit) || limit < 1) limit = 20;
    const name = query.name?.trim();
    const where: any = {};

    if (name) {
      where.nombre = { contains: name, mode: 'insensitive' };
    }

    if (typeof query.id_ciudad !== 'undefined') {
      try {
        where.id_ciudad = BigInt(query.id_ciudad);
      } catch (e) {
        where.id_ciudad = Number(query.id_ciudad);
      }
    }

    const [total, cines] = await this.prisma.$transaction([
      this.prisma.cines.count({ where }),
      this.prisma.cines.findMany({
        where,
        include: {
          ciudades: { select: { id: true, nombre: true } },
          salas: { select: { id: true, nombre: true, filas: true, columnas: true } },
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

  findOne(id: number) {
    return `This action returns a #${id} cine`;
  }

  update(id: number, updateCineDto: UpdateCineDto) {
    return `This action updates a #${id} cine`;
  }

  remove(id: number) {
    return `This action removes a #${id} cine`;
  }

  private toListItem(cine: any): CineListItemResponseDto {
    return {
      id: Number(cine.id),
      name: cine.nombre,
      address: cine.direccion ?? null,
      id_ciudad: Number(cine.id_ciudad),
      salas: cine.salas
        ? cine.salas.map((s: any) => ({ id: Number(s.id), nombre: s.nombre }))
        : [],
    };
  }
}

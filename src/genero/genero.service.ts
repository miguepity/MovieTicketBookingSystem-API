import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeneroService {
  constructor(private readonly prisma: PrismaService) {}

  async crearGenero(dto: CreateGeneroDto) {
    const existe = await this.prisma.generos.findUnique({
      where: {
        nombre: dto.nombre,
        deteledAt: null,
      },
    });

    if (existe) {
      throw new ConflictException('El género ya existe');
    }

    return await this.prisma.generos.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async getAll() {
    const generos = await this.prisma.generos.findMany({
      where: { deletedAt: null },
      select: { id: true, nombre: true, deletedAt: true },
      orderBy: { nombre: 'asc' },
    });

    return generos.map((g) => ({
      ...g,
      activo: g.deletedAt === null,
      deletedAt: undefined,
    }));
  }

  async getAllActive() {
    return await this.prisma.generos.findMany({
      where: { deletedAt: null },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getById(id: number) {
    const genero = await this.prisma.generos.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      select: { id: true, nombre: true, deletedAt: true },
    });

    if (!genero) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    return {
      ...genero,
      activo: genero.deletedAt === null,
      deletedAt: undefined,
    };
  }

  async update(id: number, dto: CreateGeneroDto) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!genero) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    const existe = await this.prisma.generos.findUnique({
      where: {
        nombre: dto.nombre,
        deletedAt: null,
        NOT: { id: BigInt(id) },
      },
    });

    if (existe && existe.id !== BigInt(id)) {
      throw new ConflictException(
        'Ya existe un genero con el nombre ' + dto.nombre,
      );
    }

    return await this.prisma.generos.update({
      where: { id: BigInt(id) },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async delete(id: number) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!genero) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    await this.prisma.generos.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return { message: `Género con id ${id} eliminado exitosamente` };
  }
}

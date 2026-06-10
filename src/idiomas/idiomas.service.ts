import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/browser';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIdiomaDto) {
    const existe = await this.prisma.idiomas.findUnique({
      where: {
        nombre: dto.nombre,
        deletedAt: null,
      },
    });

    if (existe) {
      throw new ConflictException('El idioma ya existe');
    }

    return await this.prisma.idiomas.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async getAll() {
    const idiomas = await this.prisma.idiomas.findMany({
      where: { deletedAt: null },
      select: { id: true, nombre: true, deletedAt: true },
      orderBy: { nombre: 'asc' },
    });
    return idiomas.map((i) => ({
      ...i,
      activo: i.deletedAt === null,
      deletedAt: undefined,
    }));
  }

  async getAllActive() {
    return await this.prisma.idiomas.findMany({
      where: { deletedAt: null },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getById(id: number) {
    const idioma = await this.prisma.idiomas.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      select: { id: true, nombre: true, deletedAt: true },
    });
    if (!idioma) {
      throw new ConflictException('El idioma no existe');
    }
    return {
      ...idioma,
      activo: idioma.deletedAt === null,
      deletedAt: undefined,
    };
  }
}

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
      },
    });

    if (existe) {
      throw new ConflictException('El género ya existe');
    }

    return await this.prisma.generos.create({
      data: { nombre: dto.nombre },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async getAll() {
    return await this.prisma.generos.findMany({
      select: { id: true, nombre: true, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getById(id: number) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre: true, activo: true },
    });

    if (!genero) {
      throw new NotFoundException(`Genero con id ${id} no encontrado`);
    }

    return genero;
  }

  async update(id: number, dto: CreateGeneroDto) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id) },
    });

    if (!genero || !genero.activo) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    const existe = await this.prisma.generos.findUnique({
      where: {
        nombre: dto.nombre,
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
      },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async delete(id: number) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id) },
    });

    if (!genero || !genero.activo) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    await this.prisma.generos.update({
      where: { id: BigInt(id) },
      data: { activo: false },
    });

    return { message: `Género con id ${id} eliminado exitosamente` };
  }
}

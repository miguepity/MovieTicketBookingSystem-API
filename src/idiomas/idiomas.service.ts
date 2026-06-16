import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIdiomaDto) {
    const existe = await this.prisma.idiomas.findUnique({
      where: {
        nombre: dto.nombre,
      },
    });

    if (existe) {
      throw new ConflictException('El idioma ya existe');
    }

    const idioma = await this.prisma.idiomas.create({
      data: { nombre: dto.nombre },
    });

    return {
      id: idioma.id.toString(),
      nombre: idioma.nombre,
      activo: idioma.activo,
    };
  }

  async getAll() {
    const idiomas = await this.prisma.idiomas.findMany({
      select: { id: true, nombre: true, activo: true },
      orderBy: { nombre: 'asc' },
    });
    return idiomas.map((i) => ({ ...i, id: i.id.toString() }));
  }

  async getById(id: number) {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre: true, activo: true },
    });

    if (!idioma) {
      throw new NotFoundException(`Idioma con id ${id} no encontrado`);
    }

    return { ...idioma, id: idioma.id.toString() };
  }

  async update(id: number, dto: CreateIdiomaDto) {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: BigInt(id) },
    });
    if (!idioma || !idioma.activo) {
      throw new NotFoundException('El idioma no existe');
    }

    const existe = await this.prisma.idiomas.findUnique({
      where: {
        nombre: dto.nombre,
      },
    });

    if (existe && existe.id.toString() !== id.toString()) {
      throw new ConflictException('El idioma ya existe');
    }

    const idioma_actualizado = await this.prisma.idiomas.update({
      where: { id: BigInt(id) },
      data: {
        nombre: dto.nombre,
      },
      select: { id: true, nombre: true, activo: true },
    });
    return { ...idioma_actualizado, id: idioma_actualizado.id.toString() };
  }

  async delete(id: number) {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!idioma) {
      throw new NotFoundException(`Idioma con id ${id} no encontrado`);
    }
    if (!idioma.activo) {
      throw new BadRequestException('El idioma ya está desactivado');
    }

    await this.prisma.idiomas.update({
      where: { id: BigInt(id) },
      data: { activo: false },
    });

    return { message: `Idioma con id ${id} desactivado exitosamente` };
  }
}

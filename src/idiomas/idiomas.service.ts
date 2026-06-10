import {
  Injectable,
  ConflictException,
  NotFoundException,
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

    return await this.prisma.idiomas.create({
      data: {
        nombre: dto.nombre,
        select: { id: true, nombre: true, activo: true },
      },
    });
  }

  async getAll() {
    return await this.prisma.idiomas.findMany({
      select: { id: true, nombre: true, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getById(id: number) {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre: true, activo: true },
    });

    if (!idioma) {
      throw new NotFoundException(`Idioma con id ${id} no encontrado`);
    }

    return idioma;
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

    if (existe && existe.id !== BigInt(id)) {
      throw new ConflictException('El idioma ya existe');
    }

    return await this.prisma.idiomas.update({
      where: { id: BigInt(id) },
      data: {
        nombre: dto.nombre,
      },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async delete(id: number) {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!idioma || !idioma.activo) {
      throw new NotFoundException('El idioma no existe');
    }

    await this.prisma.idiomas.update({
      where: { id: BigInt(id) },
      data: { activo: false },
    });

    return { message: `Idioma con id ${id} desactivado exitosamente` };
  }
}

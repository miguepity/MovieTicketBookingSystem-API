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
    const exite = await this.prisma.generos.findUnique({
      where: {
        nombre: dto.nombre,
      },
    });

    if (exite) {
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
    return await this.prisma.generos.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getById(id: number) {
    const genero = await this.prisma.generos.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre: true },
    });

    if (!genero) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }

    return genero;
  }
}

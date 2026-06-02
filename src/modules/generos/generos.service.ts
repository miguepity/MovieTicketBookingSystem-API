import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Genero } from './entities/genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(nombre?: string): Promise<Genero[]> {
    const trimmed = nombre?.trim();
    return this.prisma.generos.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Genero> {
    const generoId = this.parseId(id);
    const genero = await this.prisma.generos.findUnique({
      where: { id: generoId },
    });
    if (!genero) {
      throw new NotFoundException('Género no encontrado');
    }
    return genero;
  }

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    await this.assertNombreDisponible(createGeneroDto.nombre);
    return this.prisma.generos.create({
      data: createGeneroDto,
    });
  }

  async update(
    id: string,
    updateGeneroDto: UpdateGeneroDto,
  ): Promise<Genero> {
    const generoId = this.parseId(id);
    await this.assertGeneroExists(generoId);

    if (updateGeneroDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateGeneroDto.nombre, generoId);
    }

    return this.prisma.generos.update({
      where: { id: generoId },
      data: updateGeneroDto,
    });
  }

  async remove(id: string): Promise<{ id: bigint }> {
    const generoId = this.parseId(id);
    await this.assertGeneroExists(generoId);

    const peliculasCount = await this.prisma.peliculas.count({
      where: { id_genero: generoId },
    });
    if (peliculasCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el género porque tiene películas asociadas',
      );
    }

    const deleted = await this.prisma.generos.delete({
      where: { id: generoId },
      select: { id: true },
    });
    return deleted;
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertGeneroExists(id: bigint): Promise<void> {
    const genero = await this.prisma.generos.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!genero) {
      throw new NotFoundException('Género no encontrado');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existente = await this.prisma.generos.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un género con ese nombre');
    }
  }
}

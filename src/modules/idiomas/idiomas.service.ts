import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Idioma } from './entities/idioma.entity';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(nombre?: string): Promise<Idioma[]> {
    const trimmed = nombre?.trim();
    return this.prisma.idiomas.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Idioma> {
    const idiomaId = this.parseId(id);
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: idiomaId },
    });
    if (!idioma) {
      throw new NotFoundException('Idioma no encontrado');
    }
    return idioma;
  }

  async create(createIdiomaDto: CreateIdiomaDto): Promise<Idioma> {
    await this.assertNombreDisponible(createIdiomaDto.nombre);
    return this.prisma.idiomas.create({
      data: createIdiomaDto,
    });
  }

  async update(id: string, updateIdiomaDto: UpdateIdiomaDto): Promise<Idioma> {
    const idiomaId = this.parseId(id);
    await this.assertIdiomaExists(idiomaId);

    if (updateIdiomaDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateIdiomaDto.nombre, idiomaId);
    }

    return this.prisma.idiomas.update({
      where: { id: idiomaId },
      data: updateIdiomaDto,
    });
  }

  async remove(id: string): Promise<{ id: bigint }> {
    const idiomaId = this.parseId(id);
    await this.assertIdiomaExists(idiomaId);

    const peliculasCount = await this.prisma.peliculas.count({
      where: { id_idioma: idiomaId },
    });
    if (peliculasCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el idioma porque tiene películas asociadas',
      );
    }

    const deleted = await this.prisma.idiomas.delete({
      where: { id: idiomaId },
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

  private async assertIdiomaExists(id: bigint): Promise<void> {
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!idioma) {
      throw new NotFoundException('Idioma no encontrado');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existente = await this.prisma.idiomas.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un idioma con ese nombre');
    }
  }
}

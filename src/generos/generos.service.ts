import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeneroDto } from './create-generos.dto';
import { UpdateGeneroDto } from './update-generos.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeGenero(genero: any) {
    return { ...genero, id: Number(genero.id) };
  }

  async create(createGeneroDto: CreateGeneroDto) {
    const nombreFormateado = createGeneroDto.nombre.toUpperCase().trim();

    const existing = await this.prisma.generos.findUnique({
      where: { nombre: nombreFormateado },
    });
    if (existing) throw new ConflictException(`El género '${nombreFormateado}' ya existe.`);

    const nuevo = await this.prisma.generos.create({
      data: { nombre: nombreFormateado },
    });
    return this.serializeGenero(nuevo);
  }

  async findAll() {
    const generos = await this.prisma.generos.findMany({ orderBy: { nombre: 'asc' } });
    return generos.map(g => this.serializeGenero(g));
  }

  async findOne(id: number) {
    const genero = await this.prisma.generos.findUnique({ where: { id: BigInt(id) } });
    if (!genero) throw new NotFoundException(`El género con ID ${id} no existe.`);
    return this.serializeGenero(genero);
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto) {
    await this.findOne(id);

    if (updateGeneroDto.nombre) {
      const nombreFormateado = updateGeneroDto.nombre.toUpperCase().trim();
      const existing = await this.prisma.generos.findUnique({ where: { nombre: nombreFormateado } });
      
      if (existing && Number(existing.id) !== id) {
        throw new ConflictException(`Ya existe otro género con el nombre '${nombreFormateado}'.`);
      }
      updateGeneroDto.nombre = nombreFormateado;
    }

    const actualizado = await this.prisma.generos.update({
      where: { id: BigInt(id) },
      data: updateGeneroDto,
    });
    return this.serializeGenero(actualizado);
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.prisma.generos.delete({ where: { id: BigInt(id) } });
      return { message: `Género con ID ${id} eliminado exitosamente.` };
    } catch {
      throw new ConflictException('No se puede eliminar porque existen películas vinculadas a este género.');
    }
  }
}
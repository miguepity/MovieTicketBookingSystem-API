import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCiudadDto } from './create-ciudad.dto';
import { UpdateCiudadDto } from './update-ciudad.dto';

@Injectable()
export class CiudadesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeCiudad(ciudad: any) {
    return {
      ...ciudad,
      id: Number(ciudad.id),
    };
  }

  async create(createCiudadDto: CreateCiudadDto) {
    const existing = await this.prisma.ciudades.findUnique({
      where: { nombre: createCiudadDto.nombre },
    });

    if (existing) {
      throw new ConflictException('Esta ciudad ya se encuentra registrada');
    }

    const nuevaCiudad = await this.prisma.ciudades.create({
      data: createCiudadDto,
    });

    return this.serializeCiudad(nuevaCiudad);
  }

  async findAll() {
    const ciudades = await this.prisma.ciudades.findMany({
      orderBy: { nombre: 'asc' }, // Ordenadas alfabéticamente
    });
    return ciudades.map(ciudad => this.serializeCiudad(ciudad));
  }

  async findOne(id: number) {
    const ciudad = await this.prisma.ciudades.findUnique({
      where: { id: BigInt(id) },
    });

    if (!ciudad) {
      throw new NotFoundException(`La ciudad con ID ${id} no existe`);
    }

    return this.serializeCiudad(ciudad);
  }

  async update(id: number, updateCiudadDto: UpdateCiudadDto) {
    await this.findOne(id);

    if (updateCiudadDto.nombre) {
      const existing = await this.prisma.ciudades.findUnique({
        where: { nombre: updateCiudadDto.nombre },
      });
      if (existing && Number(existing.id) !== id) {
        throw new ConflictException('Ya existe otra ciudad con este nombre');
      }
    }

    const ciudadActualizada = await this.prisma.ciudades.update({
      where: { id: BigInt(id) },
      data: updateCiudadDto,
    });

    return this.serializeCiudad(ciudadActualizada);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.ciudades.delete({
        where: { id: BigInt(id) },
      });
      return { message: `Ciudad con ID ${id} eliminada exitosamente` };
    } catch (error) {
      throw new ConflictException('No se puede eliminar la ciudad porque tiene cines asociados');
    }
  }
}
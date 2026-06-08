import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ciudad } from './entities/ciudades.entity';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';
import { UpdateCiudadesDto } from './dto/update-ciudades.dto';

@Injectable()
export class CiudadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Ciudad[]> {
    return this.prisma.ciudades.findMany();
  }

  async create(createCiudadesDto: CreateCiudadesDto): Promise<Ciudad> {
    return this.prisma.ciudades.create({
      data: createCiudadesDto,
    });
  }

  async update(
    id: string,
    updateCiudadesDto: UpdateCiudadesDto,
  ): Promise<Ciudad> {
    const ciudadId = BigInt(id);

    const ciudad = await this.prisma.ciudades.findUnique({
      where: { id: ciudadId },
    });
    if (!ciudad) {
      throw new NotFoundException('Ciudad no encontrada');
    }

    return this.prisma.ciudades.update({
      where: { id: ciudadId },
      data: updateCiudadesDto,
    });
  }
}

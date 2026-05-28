import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ciudad } from './entities/ciudades.entity';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';

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
}

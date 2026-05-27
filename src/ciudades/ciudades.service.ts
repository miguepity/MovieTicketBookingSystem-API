import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ciudad } from './entities/ciudades.entity';

@Injectable()
export class CiudadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Ciudad[]> {
    return this.prisma.ciudades.findMany();
  }
}

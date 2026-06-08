import { Injectable } from '@nestjs/common';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CiudadesService {
  constructor(private prismaService: PrismaService) {}

  async create(createCiudadeDto: CreateCiudadeDto) {
    return await this.prismaService.ciudades.create({ data: createCiudadeDto });
  }

  async findAll() {
    return await this.prismaService.ciudades.findMany();
  }

  async update(id: number, updateCiudadeDto: CreateCiudadeDto) {
    return await this.prismaService.ciudades.update({
      where: { id },
      data: updateCiudadeDto,
    });
  }
}

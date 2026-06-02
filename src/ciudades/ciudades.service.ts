import { Injectable } from '@nestjs/common';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { UpdateCiudadeDto } from './dto/update-ciudade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CiudadesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCiudadeDto: CreateCiudadeDto) {
    return this.prisma.ciudades.create({
      data: { ...createCiudadeDto },
    });
  }

  findAll() {
    return this.prisma.ciudades.findMany();
  }

  findOne(id: number) {
    return this.prisma.ciudades.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCiudadeDto: UpdateCiudadeDto) {
    return this.prisma.ciudades.update({
      where: { id },
      data: { ...updateCiudadeDto },
    });
  }

  remove(id: number) {
    return this.prisma.ciudades.delete({
      where: { id },
    });
  }
}

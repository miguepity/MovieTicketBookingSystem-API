import { Injectable } from '@nestjs/common';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CiudadesService {
  constructor(private prismaService: PrismaService) {}

  create(createCiudadeDto: CreateCiudadeDto) {
    return this.prismaService.ciudades.create({ data: createCiudadeDto });
  }
}

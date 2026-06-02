import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCineDto } from './dto/create-cine.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCineDto: CreateCineDto): Promise<CineCreatedResponseDto> {
    const city = await this.prisma.ciudades.findUnique({
      where: { id: createCineDto.id_ciudad },
      select: { id: true },
    });
    if (!city) {
      throw new BadRequestException('Ciudad no existe');
    }

    const cine = await this.prisma.cines.create({
      data: {
        nombre: createCineDto.nombre,
        direccion: createCineDto.direccion,
        id_ciudad: createCineDto.id_ciudad,
      },
      select: { id: true },
    });

    return { id: cine.id };
  }

  findAll() {
    return `This action returns all cine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cine`;
  }

  update(id: number, updateCineDto: UpdateCineDto) {
    return `This action updates a #${id} cine`;
  }

  remove(id: number) {
    return `This action removes a #${id} cine`;
  }
}

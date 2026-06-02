import { Injectable, ConflictException } from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSalaDto: CreateSalaDto) {
    const existing = await this.prisma.salas.findFirst({
      where: { nombre: createSalaDto.nombre },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una sala con el nombre "${createSalaDto.nombre}"`,
      );
    }

    const created = await this.prisma.salas.create({
      data: {
        nombre: createSalaDto.nombre,
        id_cine: createSalaDto.id_cine,
        filas: createSalaDto.filas,
        columnas: createSalaDto.columnas,
      },
    });
    return created;
  }

  findAll() {
    return `This action returns all salas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sala`;
  }

  update(id: number, updateSalaDto: UpdateSalaDto) {
    return `This action updates a #${id} sala`;
  }

  remove(id: number) {
    return `This action removes a #${id} sala`;
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';

@Injectable()
export class AsientosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAsientoDto: CreateAsientoDto) {
    const existe = await this.prisma.asientos.findUnique({
      where: {
        id_sala_fila_columna: {
          id_sala: createAsientoDto.id_sala,
          fila: createAsientoDto.fila,
          columna: createAsientoDto.columna,
        },
      },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un asiento en la fila ${createAsientoDto.fila}, columna ${createAsientoDto.columna} de esa sala`,
      );
    }

    return this.prisma.asientos.create({
      data: createAsientoDto,
    });
  }

  async findAll() {
    return this.prisma.asientos.findMany({
      include: { salas: true },
    });
  }

  async findOne(id: number) {
    const asiento = await this.prisma.asientos.findUnique({
      where: { id },
      include: { salas: true },
    });

    if (!asiento) {
      throw new NotFoundException(`Asiento #${id} no encontrado`);
    }

    return asiento;
  }

  async update(id: number, updateAsientoDto: UpdateAsientoDto) {
    await this.findOne(id); // lanza NotFoundException si no existe

    return this.prisma.asientos.update({
      where: { id },
      data: updateAsientoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // lanza NotFoundException si no existe

    return this.prisma.asientos.delete({
      where: { id },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsientosFuncionDto } from './dto/create-asientos-funcion.dto';
import { UpdateAsientosFuncionDto } from './dto/update-asientos-funcion.dto';

@Injectable()
export class AsientosFuncionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAsientosFuncionDto) {
    const existe = await this.prisma.asientosFuncion.findFirst({
      where: {
        id_asiento: BigInt(dto.id_asiento),
        id_funcion: BigInt(dto.id_funcion),
      },
    });

    if (existe) {
      throw new ConflictException('El asiento ya está asignado a esta función');
    }

    return this.prisma.asientosFuncion.create({
      data: {
        id_asiento: BigInt(dto.id_asiento),
        id_funcion: BigInt(dto.id_funcion),
        estado: dto.estado,
        id_usuario: dto.id_usuario ? BigInt(dto.id_usuario) : null,
        version: dto.version,
      },
    });
  }

  async findAll() {
    return this.prisma.asientosFuncion.findMany({
      include: {
        asientos: true,
        funciones: true,
      },
    });
  }

  async findOne(id: number) {
    const asientoFuncion = await this.prisma.asientosFuncion.findUnique({
      where: { id: BigInt(id) },
      include: {
        asientos: true,
        funciones: true,
        usuarios: true,
      },
    });

    if (!asientoFuncion) {
      throw new NotFoundException(`AsientoFuncion #${id} no encontrado`);
    }

    return asientoFuncion;
  }

  async update(id: number, dto: UpdateAsientosFuncionDto) {
    await this.findOne(id);

    return this.prisma.asientosFuncion.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.estado !== undefined && { estado: dto.estado }),
        ...(dto.id_usuario !== undefined && {
          id_usuario: dto.id_usuario ? BigInt(dto.id_usuario) : null,
        }),
        ...(dto.version !== undefined && { version: dto.version }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.asientosFuncion.delete({
      where: { id: BigInt(id) },
    });
  }
}

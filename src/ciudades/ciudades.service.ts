import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const ciudad = await this.prismaService.ciudades.findUnique({
      where: { id: BigInt(id) },
    });

    if (!ciudad || !ciudad.activo) {
      throw new NotFoundException(`Ciudad con id ${id} no encontrada`);
    }

    return await this.prismaService.ciudades.update({
      where: { id: BigInt(id) },
      data: updateCiudadeDto,
    });
  }

  async delete(id: number) {
    const ciudad = await this.prismaService.ciudades.findUnique({
      where: { id: BigInt(id) },
    });

    if (!ciudad || !ciudad.activo) {
      throw new NotFoundException(`Ciudad con id ${id} no encontrada`);
    }

    await this.prismaService.ciudades.update({
      where: { id: BigInt(id) },
      data: { activo: false },
    });

    return { message: `Ciudad con id ${id} desactivada exitosamente` };
  }

  async reactivar(id: number) {
    const ciudad = await this.prismaService.ciudades.findUnique({
      where: { id: BigInt(id) },
    });

    if (!ciudad) {
      throw new NotFoundException(`Ciudad con id ${id} no encontrada`);
    }

    if (ciudad.activo) {
      throw new BadRequestException(`La ciudad ya está activa`);
    }

    await this.prismaService.ciudades.update({
      where: { id: BigInt(id) },
      data: { activo: true },
    });

    return { message: `Ciudad con id ${id} reactivada exitosamente` };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CiudadesService {
  constructor(private prismaService: PrismaService) {}

  async create(createCiudadeDto: CreateCiudadeDto) {
    const newCiudad = this.normalizar(createCiudadeDto.nombre);

    const ciudades = await this.prismaService.ciudades.findMany();
    const existe = ciudades.find(
      (c) => this.normalizar(c.nombre) === newCiudad,
    );

    if (existe) {
      throw new ConflictException(
        `Ya existe una ciudad con el nombre "${createCiudadeDto.nombre}"`,
      );
    }

    return await this.prismaService.ciudades.create({ data: createCiudadeDto });
  }

  async findAll() {
    return await this.prismaService.ciudades.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async update(id: number, updateCiudadeDto: CreateCiudadeDto) {
    const ciudad = await this.prismaService.ciudades.findUnique({
      where: { id: BigInt(id) },
    });

    if (!ciudad || !ciudad.activo) {
      throw new NotFoundException(`Ciudad con id ${id} no encontrada`);
    }

    if (updateCiudadeDto.nombre) {
      const newCiudad = this.normalizar(updateCiudadeDto.nombre);
      const ciudades = await this.prismaService.ciudades.findMany({
        where: { NOT: { id: BigInt(id) } },
      });
      const existe = ciudades.find(
        (c) => this.normalizar(c.nombre) === newCiudad,
      );

      if (existe) {
        throw new ConflictException(
          `Ya existe una ciudad con el nombre "${updateCiudadeDto.nombre}"`,
        );
      }
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

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

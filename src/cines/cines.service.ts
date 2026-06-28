import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

@Injectable()
export class CinesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  async crearCine(dto: CreateCineDto) {
    const ciudad = await this.prisma.ciudades.findUnique({
      where: { id: BigInt(dto.id_ciudad) },
    });
    if (!ciudad) {
      throw new NotFoundException(
        `Ciudad con id ${dto.id_ciudad} no encontrada`,
      );
    }

    const cinesEnCiudad = await this.prisma.cines.findMany({
      where: { id_ciudad: BigInt(dto.id_ciudad) },
    });
    const nombreNormalizado = this.normalizar(dto.nombre);
    const existe = cinesEnCiudad.find(
      (c) => this.normalizar(c.nombre) === nombreNormalizado,
    );

    if (existe) {
      throw new ConflictException(
        `Ya existe un cine con ese nombre en esta ciudad`,
      );
    }

    return await this.prisma.cines.create({
      data: {
        nombre: dto.nombre,
        direccion: dto.direccion,
        id_ciudad: BigInt(dto.id_ciudad),
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        created_at: true,
      },
    });
  }

  async getCine(id: number) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        created_at: true,
        salas: {
          select: {
            id: true,
            nombre: true,
            filas: true,
            columnas: true,
          },
          orderBy: { nombre: 'asc' },
        },
      },
    });
    if (!cine) {
      throw new NotFoundException(`Cine con id ${id} no encontrado`);
    }
    return cine;
  }

  async update(id: number, dto: UpdateCineDto) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
    });
    if (!cine) {
      throw new NotFoundException(`Cine con id ${id} no encontrado`);
    }

    if (dto.id_ciudad) {
      const ciudad = await this.prisma.ciudades.findUnique({
        where: { id: BigInt(dto.id_ciudad) },
      });
      if (!ciudad) {
        throw new NotFoundException(
          `Ciudad con id ${dto.id_ciudad} no encontrada`,
        );
      }
    }

    if (dto.nombre) {
      const idCiudad = dto.id_ciudad ?? Number(cine.id_ciudad);
      const cinesEnCiudad = await this.prisma.cines.findMany({
        where: {
          id_ciudad: BigInt(idCiudad),
          NOT: { id: BigInt(id) },
        },
      });
      const nombreNormalizado = this.normalizar(dto.nombre);
      const existe = cinesEnCiudad.find(
        (c) => this.normalizar(c.nombre) === nombreNormalizado,
      );

      if (existe) {
        throw new ConflictException(
          `Ya existe un cine con ese nombre en esta ciudad`,
        );
      }
    }

    return await this.prisma.cines.update({
      where: { id: BigInt(id) },
      data: {
        nombre: dto.nombre,
        direccion: dto.direccion,
        ...(dto.id_ciudad && { id_ciudad: BigInt(dto.id_ciudad) }),
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        created_at: true,
      },
    });
  }

  async getCines() {
    return await this.prisma.cines.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        activo: true,
        created_at: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async delete(id: number) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cine || !cine.activo) {
      throw new NotFoundException(`Cine con id ${id} no encontrado`);
    }

    await this.prisma.cines.update({
      where: { id: BigInt(id) },
      data: { activo: false },
    });

    return { message: `Cine con id ${id} desactivado exitosamente` };
  }

  async reactivar(id: number) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cine) {
      throw new NotFoundException(`Cine con id ${id} no encontrado`);
    }

    if (cine.activo) {
      throw new BadRequestException(`El cine ya está activo`);
    }

    await this.prisma.cines.update({
      where: { id: BigInt(id) },
      data: { activo: true },
    });

    return { message: `Cine con id ${id} reactivado exitosamente` };
  }
}
//EVER NO ESTUVO AQUI <3

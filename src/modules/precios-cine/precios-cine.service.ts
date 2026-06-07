import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { CreatePrecioCineDto } from './dto/create-precio-cine.dto';
import { UpdatePrecioCineDto } from './dto/update-precio-cine.dto';
import { ListPreciosCineQueryDto } from './dto/list-precios-cine-query.dto';

type PrecioCinePayload = Prisma.PreciosCineGetPayload<{
  include: {
    cines: { select: { id: true; nombre: true } };
    tipoAsiento: { select: { id: true; nombre: true } };
  };
}>;

@Injectable()
export class PreciosCineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListPreciosCineQueryDto) {
    const where: Prisma.PreciosCineWhereInput = {};
    if (query.id_cine !== undefined) {
      where.id_cine = BigInt(query.id_cine);
    }
    if (query.id_tipo_asiento !== undefined) {
      where.id_tipo_asiento = BigInt(query.id_tipo_asiento);
    }

    const precios = await this.prisma.preciosCine.findMany({
      where,
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
      orderBy: [{ id_cine: 'asc' }, { id_tipo_asiento: 'asc' }],
    });

    return precios.map((p) => this.toResponse(p));
  }

  async findOne(id: string) {
    const precioId = this.parseId(id);
    const precio = await this.prisma.preciosCine.findUnique({
      where: { id: precioId },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    if (!precio) {
      throw new NotFoundException('Precio no encontrado');
    }
    return this.toResponse(precio);
  }

  async create(dto: CreatePrecioCineDto) {
    const idCine = BigInt(dto.id_cine);
    const idTipo = BigInt(dto.id_tipo_asiento);

    const cine = await this.prisma.cines.findUnique({
      where: { id: idCine },
      select: { id: true },
    });
    if (!cine) {
      throw new BadRequestException('Cine no existe');
    }

    const tipo = await this.prisma.tiposAsiento.findUnique({
      where: { id: idTipo },
      select: { id: true },
    });
    if (!tipo) {
      throw new BadRequestException('Tipo de asiento no existe');
    }

    const duplicado = await this.prisma.preciosCine.findUnique({
      where: {
        id_cine_id_tipo_asiento: {
          id_cine: idCine,
          id_tipo_asiento: idTipo,
        },
      },
      select: { id: true },
    });
    if (duplicado) {
      throw new ConflictException(
        'Ya existe un precio para ese cine y tipo de asiento',
      );
    }

    const precio = await this.prisma.preciosCine.create({
      data: {
        id_cine: idCine,
        id_tipo_asiento: idTipo,
        precio: new Prisma.Decimal(dto.precio),
      },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    return this.toResponse(precio);
  }

  async update(id: string, dto: UpdatePrecioCineDto) {
    const precioId = this.parseId(id);
    await this.assertExists(precioId);

    const precio = await this.prisma.preciosCine.update({
      where: { id: precioId },
      data: { precio: new Prisma.Decimal(dto.precio) },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    return this.toResponse(precio);
  }

  async remove(id: string) {
    const precioId = this.parseId(id);
    await this.assertExists(precioId);

    await this.prisma.preciosCine.delete({ where: { id: precioId } });
    return { id: precioId.toString() };
  }

  private toResponse(p: PrecioCinePayload) {
    return {
      id: p.id.toString(),
      precio: p.precio.toFixed(2),
      cine: {
        id: p.cines.id.toString(),
        nombre: p.cines.nombre,
      },
      tipo_asiento: {
        id: p.tipoAsiento.id.toString(),
        nombre: p.tipoAsiento.nombre,
      },
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertExists(id: bigint): Promise<void> {
    const existing = await this.prisma.preciosCine.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Precio no encontrado');
    }
  }
}

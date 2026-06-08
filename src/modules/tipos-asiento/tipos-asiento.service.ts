import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTipoAsientoDto } from './dto/create-tipo-asiento.dto';
import { UpdateTipoAsientoDto } from './dto/update-tipo-asiento.dto';

@Injectable()
export class TiposAsientoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(nombre?: string) {
    const trimmed = nombre?.trim();
    const tipos = await this.prisma.tiposAsiento.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
    return tipos.map((t) => ({ id: t.id.toString(), nombre: t.nombre }));
  }

  async findOne(id: string) {
    const tipoId = this.parseId(id);
    const tipo = await this.prisma.tiposAsiento.findUnique({
      where: { id: tipoId },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de asiento no encontrado');
    }
    return { id: tipo.id.toString(), nombre: tipo.nombre };
  }

  async create(dto: CreateTipoAsientoDto) {
    await this.assertNombreDisponible(dto.nombre);
    const tipo = await this.prisma.tiposAsiento.create({
      data: { nombre: dto.nombre },
    });
    return { id: tipo.id.toString(), nombre: tipo.nombre };
  }

  async update(id: string, dto: UpdateTipoAsientoDto) {
    const tipoId = this.parseId(id);
    await this.assertExists(tipoId);

    if (dto.nombre !== undefined) {
      await this.assertNombreDisponible(dto.nombre, tipoId);
    }

    const tipo = await this.prisma.tiposAsiento.update({
      where: { id: tipoId },
      data: { nombre: dto.nombre },
    });
    return { id: tipo.id.toString(), nombre: tipo.nombre };
  }

  async remove(id: string) {
    const tipoId = this.parseId(id);
    await this.assertExists(tipoId);

    const asientosCount = await this.prisma.asientos.count({
      where: { id_tipo_asiento: tipoId },
    });
    if (asientosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar: el tipo tiene asientos asociados',
      );
    }

    const preciosCount = await this.prisma.preciosCine.count({
      where: { id_tipo_asiento: tipoId },
    });
    if (preciosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar: el tipo tiene precios configurados en algún cine',
      );
    }

    await this.prisma.tiposAsiento.delete({ where: { id: tipoId } });
    return { id: tipoId.toString() };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertExists(id: bigint): Promise<void> {
    const tipo = await this.prisma.tiposAsiento.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de asiento no encontrado');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existente = await this.prisma.tiposAsiento.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException(
        'Ya existe un tipo de asiento con ese nombre',
      );
    }
  }
}

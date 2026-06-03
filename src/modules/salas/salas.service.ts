import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaResponseDto } from './dto/sala.response.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalaDto: CreateSalaDto): Promise<SalaResponseDto> {
    await this.assertNombreDisponible(createSalaDto.nombre);

    const created = await this.prisma.salas.create({
      data: {
        nombre: createSalaDto.nombre,
        id_cine: createSalaDto.id_cine,
        filas: createSalaDto.filas,
        columnas: createSalaDto.columnas,
      },
    });

    return this.toDto(created);
  }

  async findAll(id_cine?: string): Promise<SalaResponseDto[]> {
    const where = id_cine ? { id_cine: this.parseId(id_cine) } : undefined;

    const salas = await this.prisma.salas.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    return salas.map((s) => this.toDto(s));
  }

  async findOne(id: string): Promise<SalaResponseDto> {
    const salaId = this.parseId(id);
    const sala = await this.prisma.salas.findUnique({ where: { id: salaId } });

    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    return this.toDto(sala);
  }

  async update(
    id: string,
    updateSalaDto: UpdateSalaDto,
  ): Promise<SalaResponseDto> {
    const salaId = this.parseId(id);
    await this.assertSalaExists(salaId);

    if (updateSalaDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateSalaDto.nombre, salaId);
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: salaId,
        fecha_hora: { gte: new Date() },
      },
    });

    const updated = await this.prisma.salas.update({
      where: { id: salaId },
      data: {
        nombre: updateSalaDto.nombre,
        id_cine: updateSalaDto.id_cine,
        filas: updateSalaDto.filas,
        columnas: updateSalaDto.columnas,
      },
    });

    const result = this.toDto(updated);
    if (funcionesActivas > 0) {
      result.warning = `La sala tiene ${funcionesActivas} función(es) activa(s). Los cambios pueden afectar las reservas existentes.`;
    }

    return result;
  }

  async remove(id: string): Promise<{ id: number }> {
    const salaId = this.parseId(id);
    await this.assertSalaExists(salaId);

    const funcionesCount = await this.prisma.funciones.count({
      where: { id_sala: salaId },
    });

    if (funcionesCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la sala porque tiene funciones asociadas',
      );
    }

    const deleted = await this.prisma.salas.delete({
      where: { id: salaId },
      select: { id: true },
    });

    return { id: Number(deleted.id) };
  }

  private toDto(sala: {
    id: bigint;
    nombre: string;
    id_cine: bigint;
    filas: number;
    columnas: number;
  }): SalaResponseDto {
    return {
      id: Number(sala.id),
      nombre: sala.nombre,
      id_cine: Number(sala.id_cine),
      filas: sala.filas,
      columnas: sala.columnas,
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertSalaExists(id: bigint): Promise<void> {
    const sala = await this.prisma.salas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existing = await this.prisma.salas.findFirst({
      where: { nombre },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Ya existe una sala con el nombre "${nombre}"`,
      );
    }
  }
}

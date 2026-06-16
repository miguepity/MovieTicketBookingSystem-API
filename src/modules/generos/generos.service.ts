import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Genero } from './entities/genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotGenero } from '../audit-log/snapshots';

@Injectable()
export class GenerosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(nombre?: string): Promise<Genero[]> {
    const trimmed = nombre?.trim();
    return this.prisma.generos.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Genero> {
    const generoId = this.parseId(id);
    const genero = await this.prisma.generos.findUnique({
      where: { id: generoId },
    });
    if (!genero) {
      throw new NotFoundException('Género no encontrado');
    }
    return genero;
  }

  async create(
    createGeneroDto: CreateGeneroDto,
    auditorId: bigint,
  ): Promise<Genero> {
    await this.assertNombreDisponible(createGeneroDto.nombre);
    const nuevo = await this.prisma.generos.create({
      data: createGeneroDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'GENERO_CREAR',
      entidad: 'Genero',
      entidad_id: nuevo.id,
      detalle: `Género ${nuevo.id.toString()} (${nuevo.nombre}) creado`,
      valor_nuevo: snapshotGenero(nuevo),
    });

    return nuevo;
  }

  async update(
    id: string,
    updateGeneroDto: UpdateGeneroDto,
    auditorId: bigint,
  ): Promise<Genero> {
    const generoId = this.parseId(id);
    const prev = await this.prisma.generos.findUnique({
      where: { id: generoId },
    });
    if (!prev) {
      throw new NotFoundException('Género no encontrado');
    }

    if (updateGeneroDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateGeneroDto.nombre, generoId);
    }

    const updated = await this.prisma.generos.update({
      where: { id: generoId },
      data: updateGeneroDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'GENERO_EDITAR',
      entidad: 'Genero',
      entidad_id: updated.id,
      detalle: `Género ${updated.id.toString()} (${updated.nombre}) actualizado`,
      valor_anterior: snapshotGenero(prev),
      valor_nuevo: snapshotGenero(updated),
    });

    return updated;
  }

  async remove(id: string, auditorId: bigint): Promise<{ id: bigint }> {
    const generoId = this.parseId(id);
    const existing = await this.prisma.generos.findUnique({
      where: { id: generoId },
    });
    if (!existing) {
      throw new NotFoundException('Género no encontrado');
    }

    const peliculasCount = await this.prisma.peliculas.count({
      where: { id_genero: generoId },
    });
    if (peliculasCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el género porque tiene películas asociadas',
      );
    }

    const deleted = await this.prisma.generos.delete({
      where: { id: generoId },
      select: { id: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'GENERO_ELIMINAR',
      entidad: 'Genero',
      entidad_id: deleted.id,
      detalle: `Género ${deleted.id.toString()} (${existing.nombre}) eliminado`,
      valor_anterior: snapshotGenero(existing),
    });

    return deleted;
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existente = await this.prisma.generos.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un género con ese nombre');
    }
  }
}

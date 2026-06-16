import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Idioma } from './entities/idioma.entity';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotIdioma } from '../audit-log/snapshots';

@Injectable()
export class IdiomasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(nombre?: string): Promise<Idioma[]> {
    const trimmed = nombre?.trim();
    return this.prisma.idiomas.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Idioma> {
    const idiomaId = this.parseId(id);
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id: idiomaId },
    });
    if (!idioma) {
      throw new NotFoundException('Idioma no encontrado');
    }
    return idioma;
  }

  async create(
    createIdiomaDto: CreateIdiomaDto,
    auditorId: bigint,
  ): Promise<Idioma> {
    await this.assertNombreDisponible(createIdiomaDto.nombre);
    const nuevo = await this.prisma.idiomas.create({
      data: createIdiomaDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'IDIOMA_CREAR',
      entidad: 'Idioma',
      entidad_id: nuevo.id,
      detalle: `Idioma ${nuevo.id.toString()} (${nuevo.nombre}) creado`,
      valor_nuevo: snapshotIdioma(nuevo),
    });

    return nuevo;
  }

  async update(
    id: string,
    updateIdiomaDto: UpdateIdiomaDto,
    auditorId: bigint,
  ): Promise<Idioma> {
    const idiomaId = this.parseId(id);
    const prev = await this.prisma.idiomas.findUnique({
      where: { id: idiomaId },
    });
    if (!prev) {
      throw new NotFoundException('Idioma no encontrado');
    }

    if (updateIdiomaDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateIdiomaDto.nombre, idiomaId);
    }

    const updated = await this.prisma.idiomas.update({
      where: { id: idiomaId },
      data: updateIdiomaDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'IDIOMA_EDITAR',
      entidad: 'Idioma',
      entidad_id: updated.id,
      detalle: `Idioma ${updated.id.toString()} (${updated.nombre}) actualizado`,
      valor_anterior: snapshotIdioma(prev),
      valor_nuevo: snapshotIdioma(updated),
    });

    return updated;
  }

  async remove(id: string, auditorId: bigint): Promise<{ id: bigint }> {
    const idiomaId = this.parseId(id);
    const existing = await this.prisma.idiomas.findUnique({
      where: { id: idiomaId },
    });
    if (!existing) {
      throw new NotFoundException('Idioma no encontrado');
    }

    const peliculasCount = await this.prisma.peliculas.count({
      where: { id_idioma: idiomaId },
    });
    if (peliculasCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el idioma porque tiene películas asociadas',
      );
    }

    const deleted = await this.prisma.idiomas.delete({
      where: { id: idiomaId },
      select: { id: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'IDIOMA_ELIMINAR',
      entidad: 'Idioma',
      entidad_id: deleted.id,
      detalle: `Idioma ${deleted.id.toString()} (${existing.nombre}) eliminado`,
      valor_anterior: snapshotIdioma(existing),
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
    const existente = await this.prisma.idiomas.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un idioma con ese nombre');
    }
  }
}

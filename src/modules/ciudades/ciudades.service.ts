import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ciudad } from './entities/ciudades.entity';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';
import { UpdateCiudadesDto } from './dto/update-ciudades.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotCiudad } from '../audit-log/snapshots';

@Injectable()
export class CiudadesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(): Promise<Ciudad[]> {
    return this.prisma.ciudades.findMany();
  }

  async create(
    createCiudadesDto: CreateCiudadesDto,
    auditorId: bigint,
  ): Promise<Ciudad> {
    const nuevo = await this.prisma.ciudades.create({
      data: createCiudadesDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CIUDAD_CREAR',
      entidad: 'Ciudad',
      entidad_id: nuevo.id,
      detalle: `Ciudad ${nuevo.id.toString()} (${nuevo.nombre}) creada`,
      valor_nuevo: snapshotCiudad(nuevo),
    });

    return nuevo;
  }

  async delete(id: bigint, auditorId: bigint): Promise<Ciudad> {
    const used = await this.prisma.cines.count({ where: { id_ciudad: id } });
    if (used > 0) throw new ConflictException('Ciudad tiene cines asociados');
    const before = await this.prisma.ciudades.findUniqueOrThrow({ where: { id } });
    const deleted = await this.prisma.ciudades.delete({ where: { id } });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CIUDAD_ELIMINAR',
      entidad: 'Ciudad',
      entidad_id: id,
      detalle: `Ciudad ${id.toString()} (${before.nombre}) eliminada`,
      valor_anterior: snapshotCiudad(before),
    });

    return deleted;
  }

  async update(
    id: string,
    updateCiudadesDto: UpdateCiudadesDto,
    auditorId: bigint,
  ): Promise<Ciudad> {
    const ciudadId = BigInt(id);

    const prev = await this.prisma.ciudades.findUnique({
      where: { id: ciudadId },
    });
    if (!prev) {
      throw new NotFoundException('Ciudad no encontrada');
    }

    const updated = await this.prisma.ciudades.update({
      where: { id: ciudadId },
      data: updateCiudadesDto,
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CIUDAD_EDITAR',
      entidad: 'Ciudad',
      entidad_id: updated.id,
      detalle: `Ciudad ${updated.id.toString()} (${updated.nombre}) actualizada`,
      valor_anterior: snapshotCiudad(prev),
      valor_nuevo: snapshotCiudad(updated),
    });

    return updated;
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(nombre?: string): Promise<Rol[]> {
    const trimmed = nombre?.trim();
    return this.prisma.roles.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Rol> {
    const rolId = this.parseId(id);
    const rol = await this.prisma.roles.findUnique({
      where: { id: rolId },
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  async create(createRolDto: CreateRolDto, auditorId: bigint): Promise<Rol> {
    await this.assertNombreDisponible(createRolDto.nombre);
    const nuevo = await this.prisma.roles.create({
      data: createRolDto,
    });
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'ROL_CREAR',
      entidad: 'Rol',
      entidad_id: nuevo.id,
      detalle: `Rol ${nuevo.id.toString()} (${nuevo.nombre}) creado`,
      valor_nuevo: { nombre: nuevo.nombre },
    });
    return nuevo;
  }

  async update(
    id: string,
    updateRolDto: UpdateRolDto,
    auditorId: bigint,
  ): Promise<Rol> {
    const rolId = this.parseId(id);
    const previo = await this.prisma.roles.findUnique({
      where: { id: rolId },
      select: { id: true, nombre: true },
    });
    if (!previo) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (updateRolDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateRolDto.nombre, rolId);
    }

    const updated = await this.prisma.roles.update({
      where: { id: rolId },
      data: updateRolDto,
    });
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'ROL_EDITAR',
      entidad: 'Rol',
      entidad_id: updated.id,
      detalle: `Rol ${updated.id.toString()} (${updated.nombre}) editado`,
      valor_anterior: { nombre: previo.nombre },
      valor_nuevo: { nombre: updated.nombre },
    });
    return updated;
  }

  async remove(id: string, auditorId: bigint): Promise<{ id: bigint }> {
    const rolId = this.parseId(id);
    const previo = await this.prisma.roles.findUnique({
      where: { id: rolId },
      select: { id: true, nombre: true },
    });
    if (!previo) {
      throw new NotFoundException('Rol no encontrado');
    }

    const usuariosCount = await this.prisma.usuarios.count({
      where: { id_rol: rolId },
    });
    if (usuariosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el rol porque tiene usuarios asociados',
      );
    }

    const deleted = await this.prisma.roles.delete({
      where: { id: rolId },
      select: { id: true },
    });
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'ROL_ELIMINAR',
      entidad: 'Rol',
      entidad_id: rolId,
      detalle: `Rol ${rolId.toString()} (${previo.nombre}) eliminado`,
      valor_anterior: { nombre: previo.nombre },
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
    const existente = await this.prisma.roles.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }
  }
}

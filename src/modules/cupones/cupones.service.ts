import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotCupon } from '../audit-log/snapshots';

@Injectable()
export class CuponesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  private async validarCodigoUnico(codigo: string, excludeId?: bigint) {
    const existente = await this.prisma.cupones.findFirst({
      where: {
        codigo,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existente) {
      throw new ConflictException('Ya existe un cupón con ese código');
    }
  }

  async create(dto: CreateCuponDto, auditorId: bigint) {
    await this.validarCodigoUnico(dto.codigo);

    const nuevo = await this.prisma.cupones.create({
      data: {
        codigo: dto.codigo,
        tipo: dto.tipo,
        valor: dto.valor,
        fecha_expiracion: new Date(dto.fecha_expiracion),
        usos_maximos: dto.usos_maximos,
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CUPON_CREAR',
      entidad: 'Cupon',
      entidad_id: nuevo.id,
      detalle: `Cupón ${nuevo.id.toString()} (${nuevo.codigo}) creado`,
      valor_nuevo: snapshotCupon(nuevo),
    });

    return nuevo;
  }

  findAll() {
    return this.prisma.cupones.findMany();
  }

  async findOne(id: string) {
    const cupon = await this.prisma.cupones.findUnique({
      where: { id: BigInt(id) },
    });
    if (!cupon) {
      throw new NotFoundException('Cupón no existe');
    }
    return cupon;
  }

  async update(id: string, dto: UpdateCuponDto, auditorId: bigint) {
    const cuponId = BigInt(id);

    const prev = await this.prisma.cupones.findUnique({
      where: { id: cuponId },
    });

    if (!prev) {
      throw new NotFoundException('Cupón no existe');
    }

    if (dto.codigo) {
      await this.validarCodigoUnico(dto.codigo, cuponId);
    }

    const updated = await this.prisma.cupones.update({
      where: { id: cuponId },
      data: {
        codigo: dto.codigo,
        tipo: dto.tipo,
        valor: dto.valor,
        fecha_expiracion: dto.fecha_expiracion
          ? new Date(dto.fecha_expiracion)
          : undefined,
        usos_maximos: dto.usos_maximos,
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CUPON_EDITAR',
      entidad: 'Cupon',
      entidad_id: updated.id,
      detalle: `Cupón ${updated.id.toString()} (${updated.codigo}) actualizado`,
      valor_anterior: snapshotCupon(prev),
      valor_nuevo: snapshotCupon(updated),
    });

    return updated;
  }

  async validar(codigo: string) {
    const cupon = await this.prisma.cupones.findUnique({
      where: { codigo },
    });

    if (!cupon) {
      throw new NotFoundException('Cupón no existe');
    }

    if (!cupon.activo) {
      throw new ConflictException('El cupón no está activo');
    }

    if (new Date(cupon.fecha_expiracion) < new Date()) {
      throw new ConflictException('El cupón ha expirado');
    }

    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      throw new ConflictException('El cupón ya alcanzó su límite de uso');
    }

    return {
      valido: true,
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      fecha_expiracion: cupon.fecha_expiracion,
    };
  }

  async toggleStatus(id: string, auditorId: bigint) {
    const cuponId = BigInt(id);

    const prev = await this.prisma.cupones.findUnique({
      where: { id: cuponId },
    });

    if (!prev) {
      throw new NotFoundException('Cupón no existe');
    }

    const updated = await this.prisma.cupones.update({
      where: { id: cuponId },
      data: {
        activo: !prev.activo,
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CUPON_TOGGLE',
      entidad: 'Cupon',
      entidad_id: updated.id,
      detalle: `Cupón ${updated.id.toString()} (${updated.codigo}) ${updated.activo ? 'activado' : 'desactivado'}`,
      valor_anterior: snapshotCupon(prev),
      valor_nuevo: snapshotCupon(updated),
    });

    return {
      id: updated.id.toString(),
      codigo: updated.codigo,
      activo: updated.activo,
    };
  }

  async remove(id: string, auditorId: bigint) {
    const cuponId = BigInt(id);

    const cupon = await this.prisma.cupones.findUnique({
      where: { id: cuponId },
      include: { pagos: { select: { id: true }, take: 1 } },
    });

    if (!cupon) {
      throw new NotFoundException('Cupón no existe');
    }

    if (cupon.pagos.length > 0) {
      throw new ConflictException(
        'No se puede eliminar el cupón porque ya fue usado en pagos',
      );
    }

    await this.prisma.cupones.delete({ where: { id: cuponId } });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'CUPON_ELIMINAR',
      entidad: 'Cupon',
      entidad_id: cuponId,
      detalle: `Cupón ${cuponId.toString()} (${cupon.codigo}) eliminado`,
      valor_anterior: snapshotCupon(cupon),
    });

    return { id: cuponId.toString(), eliminado: true };
  }
}

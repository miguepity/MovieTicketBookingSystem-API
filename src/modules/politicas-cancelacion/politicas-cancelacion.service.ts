import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotPoliticaCancelacion } from '../audit-log/snapshots';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticasCancelacionDto } from './dto/update-politicas-cancelacion.dto';
import { ListPoliticasCancelacionQueryDto } from './dto/list-politicas-cancelacion-query.dto';
import { ReglaPoliticaDto, ReglaPoliticaInputDto, ReplaceReglasDto } from './dto/regla-politica.dto';
import {
  PoliticasCancelacionListItemResponseDto,
  ReglaPoliticaResponseDto,
} from './dto/politicas-cancelacion-list-item.response.dto';
import { PoliticasCancelacionPageResponseDto } from './dto/politicas-cancelacion-page.response.dto';

@Injectable()
export class PoliticasCancelacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(
    query: ListPoliticasCancelacionQueryDto,
  ): Promise<PoliticasCancelacionPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PoliticaCancelacionWhereInput = {};
    if (query.id_cine !== undefined)
      where.id_cine = this.parseId(query.id_cine);
    if (query.activa !== undefined) where.activa = query.activa;

    const [total, politicas] = await this.prisma.$transaction([
      this.prisma.politicaCancelacion.count({ where }),
      this.prisma.politicaCancelacion.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { reglas: { orderBy: { horas_antes_minimo: 'asc' } } },
      }),
    ]);

    return {
      data: politicas.map((p) => this.toListItem(p)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PoliticasCancelacionListItemResponseDto> {
    const politicaId = this.parseId(id);
    const politica = await this.prisma.politicaCancelacion.findUnique({
      where: { id: politicaId },
      include: { reglas: { orderBy: { horas_antes_minimo: 'asc' } } },
    });
    if (!politica) {
      throw new NotFoundException('Política de cancelación no encontrada');
    }
    return this.toListItem(politica);
  }

  async create(dto: CreatePoliticaCancelacionDto, auditorId: bigint) {
    const idCine = this.parseId(dto.id_cine);
    const cine = await this.prisma.cines.findUnique({
      where: { id: idCine },
      select: { id: true },
    });
    if (!cine) {
      throw new BadRequestException('El cine no existe');
    }

    this.validarReglas(dto.reglas);

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.politicaCancelacion.updateMany({
        where: { id_cine: idCine, activa: true },
        data: { activa: false },
      });
      const politica = await tx.politicaCancelacion.create({
        data: {
          id_cine: idCine,
          nombre: dto.nombre,
          activa: true,
        },
      });
      await tx.reglaPoliticaCancelacion.createMany({
        data: dto.reglas.map((r) => ({
          id_politica: politica.id,
          horas_antes_minimo: r.horas_antes_minimo,
          horas_antes_maximo: r.horas_antes_maximo ?? null,
          porcentaje_reembolso: new Prisma.Decimal(r.porcentaje_reembolso),
        })),
      });
      return politica;
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'POLITICA_CREAR',
      entidad: 'PoliticaCancelacion',
      entidad_id: created.id,
      detalle: `Política ${created.id.toString()} creada para cine ${idCine.toString()}`,
      valor_nuevo: snapshotPoliticaCancelacion(created),
    });

    return this.findOne(created.id.toString());
  }

  async update(
    id: string,
    dto: UpdatePoliticasCancelacionDto,
    auditorId: bigint,
  ): Promise<PoliticasCancelacionListItemResponseDto> {
    const politicaId = this.parseId(id);
    const prev = await this.prisma.politicaCancelacion.findUnique({
      where: { id: politicaId },
      select: { id: true, id_cine: true, nombre: true, activa: true },
    });
    if (!prev) {
      throw new NotFoundException('Política de cancelación no encontrada');
    }

    if (dto.reglas) {
      this.validarReglas(dto.reglas);
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.nombre !== undefined) {
        await tx.politicaCancelacion.update({
          where: { id: politicaId },
          data: { nombre: dto.nombre },
        });
      }
      if (dto.reglas) {
        await tx.reglaPoliticaCancelacion.deleteMany({
          where: { id_politica: politicaId },
        });
        await tx.reglaPoliticaCancelacion.createMany({
          data: dto.reglas.map((r) => ({
            id_politica: politicaId,
            horas_antes_minimo: r.horas_antes_minimo,
            horas_antes_maximo: r.horas_antes_maximo ?? null,
            porcentaje_reembolso: new Prisma.Decimal(r.porcentaje_reembolso),
          })),
        });
      }
    });

    const updated = await this.prisma.politicaCancelacion.findUnique({
      where: { id: politicaId },
      select: { id: true, id_cine: true, nombre: true, activa: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'POLITICA_EDITAR',
      entidad: 'PoliticaCancelacion',
      entidad_id: politicaId,
      detalle: `Política ${id} editada`,
      valor_anterior: snapshotPoliticaCancelacion(prev),
      valor_nuevo: updated ? snapshotPoliticaCancelacion(updated) : undefined,
    });

    return this.findOne(id);
  }

  async desactivar(id: string, auditorId: bigint) {
    const politicaId = this.parseId(id);
    const result = await this.prisma.politicaCancelacion.updateMany({
      where: { id: politicaId, activa: true },
      data: { activa: false },
    });
    if (result.count !== 1) {
      throw new NotFoundException(
        'Política no encontrada o ya estaba desactivada',
      );
    }
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'POLITICA_DESACTIVAR',
      detalle: `Política ${id} desactivada`,
    });
    return { id, activa: false };
  }

  async listByCine(idCine: bigint) {
    return this.prisma.politicaCancelacion.findMany({
      where: { id_cine: idCine },
      orderBy: { created_at: 'desc' },
    });
  }

  async listReglas(idPolitica: bigint) {
    return this.prisma.reglaPoliticaCancelacion.findMany({
      where: { id_politica: idPolitica },
      orderBy: { horas_antes_minimo: 'asc' },
    });
  }

  async replaceReglas(idPolitica: bigint, dto: ReplaceReglasDto, auditorId: bigint) {
    const ordered = [...dto.reglas].sort(
      (a: ReglaPoliticaInputDto, b: ReglaPoliticaInputDto) =>
        a.horas_antes_minimo - b.horas_antes_minimo,
    );

    for (let i = 0; i < ordered.length; i++) {
      const r = ordered[i];
      if (r.horas_antes_minimo >= r.horas_antes_maximo) {
        throw new BadRequestException(
          'horas_antes_minimo debe ser menor que horas_antes_maximo',
        );
      }
      if (i > 0 && ordered[i - 1].horas_antes_maximo > r.horas_antes_minimo) {
        throw new BadRequestException('reglas se solapan');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.reglaPoliticaCancelacion.deleteMany({
        where: { id_politica: idPolitica },
      });
      if (ordered.length === 0) return [];
      await tx.reglaPoliticaCancelacion.createMany({
        data: ordered.map((r: ReglaPoliticaInputDto) => ({
          id_politica: idPolitica,
          horas_antes_minimo: r.horas_antes_minimo,
          horas_antes_maximo: r.horas_antes_maximo,
          porcentaje_reembolso: new Prisma.Decimal(r.porcentaje_reembolso),
        })),
      });
      return tx.reglaPoliticaCancelacion.findMany({
        where: { id_politica: idPolitica },
        orderBy: { horas_antes_minimo: 'asc' },
      });
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'POLITICA_REGLAS_REEMPLAZAR',
      entidad: 'ReglaPoliticaCancelacion',
      entidad_id: idPolitica,
      detalle: `Reglas de política ${idPolitica.toString()} reemplazadas`,
    });

    return result;
  }

  async setActiva(id: bigint, activa: boolean, auditorId: bigint) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.politicaCancelacion.findUnique({ where: { id } });
      if (!p) throw new NotFoundException('Política de cancelación no encontrada');

      if (activa) {
        await tx.politicaCancelacion.updateMany({
          where: { id_cine: p.id_cine, NOT: { id } },
          data: { activa: false },
        });
      }
      return tx.politicaCancelacion.update({ where: { id }, data: { activa } });
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: activa ? 'POLITICA_ACTIVAR' : 'POLITICA_DESACTIVAR',
      entidad: 'PoliticaCancelacion',
      entidad_id: id,
      detalle: `Política ${id.toString()} ${activa ? 'activada' : 'desactivada'}`,
      valor_nuevo: snapshotPoliticaCancelacion(updated),
    });

    return updated;
  }

  private validarReglas(reglas: ReglaPoliticaDto[]): void {
    let nullCount = 0;
    for (const r of reglas) {
      if (r.horas_antes_maximo === null || r.horas_antes_maximo === undefined) {
        nullCount++;
      } else if (r.horas_antes_maximo <= r.horas_antes_minimo) {
        throw new BadRequestException(
          'horas_antes_maximo debe ser mayor que horas_antes_minimo',
        );
      }
    }
    if (nullCount > 1) {
      throw new BadRequestException(
        'Solo una regla puede tener horas_antes_maximo = null',
      );
    }
    const sorted = [...reglas].sort(
      (a, b) => a.horas_antes_minimo - b.horas_antes_minimo,
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const next = sorted[i + 1];
      const curMax = cur.horas_antes_maximo;
      if (curMax === null || curMax === undefined) {
        throw new BadRequestException(
          'La regla con horas_antes_maximo=null debe ser la de mayor rango',
        );
      }
      if (next.horas_antes_minimo < curMax) {
        throw new BadRequestException('Las reglas se traslapan entre sí');
      }
    }
  }

  private toListItem(politica: {
    id: bigint;
    id_cine: bigint;
    nombre: string;
    activa: boolean;
    reglas: Array<{
      id: bigint;
      horas_antes_minimo: number;
      horas_antes_maximo: number | null;
      porcentaje_reembolso: Prisma.Decimal;
    }>;
  }): PoliticasCancelacionListItemResponseDto {
    return {
      id: politica.id.toString(),
      id_cine: politica.id_cine.toString(),
      nombre: politica.nombre,
      activa: politica.activa,
      reglas: politica.reglas.map(
        (r): ReglaPoliticaResponseDto => ({
          id: r.id.toString(),
          horas_antes_minimo: r.horas_antes_minimo,
          horas_antes_maximo: r.horas_antes_maximo,
          porcentaje_reembolso: Number(r.porcentaje_reembolso),
        }),
      ),
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FuncionEstado } from '../../../generated/prisma/client';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { UpdateAsientosBatchDto } from './dto/update-asientos-batch.dto';
import { SalaAsientoResponseDto } from './dto/sala-asiento.response.dto';
import { UpdateAsientosBatchResponseDto } from './dto/update-asientos-batch.response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaResponseDto } from './dto/sala.response.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotSala } from '../audit-log/snapshots';

@Injectable()
export class SalasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    createSalaDto: CreateSalaDto,
    auditorId: bigint,
  ): Promise<SalaResponseDto> {
    await this.assertNombreDisponible(
      createSalaDto.nombre,
      BigInt(createSalaDto.id_cine),
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const sala = await tx.salas.create({
        data: {
          nombre: createSalaDto.nombre,
          id_cine: BigInt(createSalaDto.id_cine),
          filas: createSalaDto.filas,
          columnas: createSalaDto.columnas,
        },
        include: { cines: true },
      });

      const tipoDefault = await tx.tiposAsiento.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!tipoDefault) {
        throw new Error('No hay TiposAsiento configurados');
      }

      const asientosData: Array<{
        id_sala: bigint;
        fila: string;
        columna: number;
        codigo: string;
        id_tipo_asiento: bigint;
      }> = [];

      for (let f = 0; f < sala.filas; f++) {
        const filaLetra = String.fromCharCode(65 + f);
        for (let c = 1; c <= sala.columnas; c++) {
          asientosData.push({
            id_sala: sala.id,
            fila: filaLetra,
            columna: c,
            codigo: `${filaLetra}${c}`,
            id_tipo_asiento: tipoDefault.id,
          });
        }
      }

      await tx.asientos.createMany({ data: asientosData });

      return sala;
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_CREAR',
      entidad: 'Sala',
      entidad_id: created.id,
      detalle: `Sala ${created.id.toString()} (${created.nombre}) creada`,
      valor_nuevo: snapshotSala(created),
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
    auditorId: bigint,
  ): Promise<SalaResponseDto> {
    const salaId = this.parseId(id);
    const prev = await this.prisma.salas.findUnique({
      where: { id: salaId },
      include: { cines: true },
    });
    if (!prev) {
      throw new NotFoundException('Sala no encontrada');
    }

    if (updateSalaDto.nombre !== undefined) {
      const targetCine =
        updateSalaDto.id_cine !== undefined
          ? BigInt(updateSalaDto.id_cine)
          : prev.id_cine;
      await this.assertNombreDisponible(
        updateSalaDto.nombre,
        targetCine,
        salaId,
      );
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: salaId,
        estado: { in: [FuncionEstado.programada, FuncionEstado.en_curso] },
      },
    });

    // Detect dimension change
    const dimensionsChanged =
      (updateSalaDto.filas !== undefined && updateSalaDto.filas !== prev.filas) ||
      (updateSalaDto.columnas !== undefined &&
        updateSalaDto.columnas !== prev.columnas);

    if (dimensionsChanged) {
      // Hard guard: cannot change dimensions if any seats are physically reserved
      // (asientosFuncion rows would orphan or cascade — destroy real reservations)
      const reservaExistente = await this.prisma.asientosFuncion.findFirst({
        where: { asientos: { id_sala: salaId } },
      });
      if (reservaExistente) {
        throw new ConflictException(
          'No se puede cambiar las dimensiones de la sala porque tiene funciones con asientos reservados. Cancele o finalice las funciones primero.',
        );
      }

      // Soft guard: there are scheduled/in-progress funciones (no seats reserved yet).
      // Require explicit confirmation via `force: true` so the operator opts in knowingly.
      if (funcionesActivas > 0 && !updateSalaDto.force) {
        throw new ConflictException({
          statusCode: 409,
          code: 'REQUIRES_DIMENSION_CHANGE_CONFIRMATION',
          message: `La sala tiene ${funcionesActivas} función(es) activa(s). Confirmá el cambio de dimensiones para continuar.`,
          funcionesActivas,
          requiresConfirmation: true,
        });
      }
    }

    // prev is non-null here; its type matches what salas.update returns with { include: { cines: true } }
    let updated: NonNullable<typeof prev>;

    if (dimensionsChanged) {
      updated = await this.prisma.$transaction(async (tx) => {
        // Snapshot existing tipo by (fila, columna)
        const previos = await tx.asientos.findMany({
          where: { id_sala: salaId },
          select: { fila: true, columna: true, id_tipo_asiento: true },
        });
        const tipoPrev = new Map<string, bigint>(
          previos.map((a) => [`${a.fila}-${a.columna}`, a.id_tipo_asiento]),
        );

        // Re-check inside the transaction to close the TOCTOU race window
        const racing = await tx.asientosFuncion.findFirst({
          where: { asientos: { id_sala: salaId } },
          select: { id: true },
        });
        if (racing) {
          throw new ConflictException(
            'No se puede cambiar las dimensiones de la sala porque tiene funciones con asientos reservados. Cancele o finalice las funciones primero.',
          );
        }

        // Delete old asientos
        await tx.asientos.deleteMany({ where: { id_sala: salaId } });

        // Default tipo lookup
        const tipoDefault = await tx.tiposAsiento.findFirst({
          orderBy: { id: 'asc' },
        });
        if (!tipoDefault) {
          throw new Error('No hay TiposAsiento configurados');
        }

        // Update the salas row
        const sala = await tx.salas.update({
          where: { id: salaId },
          data: {
            nombre: updateSalaDto.nombre,
            id_cine:
              updateSalaDto.id_cine !== undefined
                ? BigInt(updateSalaDto.id_cine)
                : undefined,
            filas: updateSalaDto.filas,
            columnas: updateSalaDto.columnas,
          },
          include: { cines: true },
        });

        // Generate new asientos preserving existing tipos where coordinates overlap
        const nuevas: Array<{
          id_sala: bigint;
          fila: string;
          columna: number;
          codigo: string;
          id_tipo_asiento: bigint;
        }> = [];
        for (let f = 0; f < sala.filas; f++) {
          const filaLetra = String.fromCharCode(65 + f);
          for (let c = 1; c <= sala.columnas; c++) {
            const prevTipo = tipoPrev.get(`${filaLetra}-${c}`);
            nuevas.push({
              id_sala: salaId,
              fila: filaLetra,
              columna: c,
              codigo: `${filaLetra}${c}`,
              id_tipo_asiento: prevTipo ?? tipoDefault.id,
            });
          }
        }
        await tx.asientos.createMany({ data: nuevas });

        return sala;
      });
    } else {
      updated = await this.prisma.salas.update({
        where: { id: salaId },
        data: {
          nombre: updateSalaDto.nombre,
          id_cine:
            updateSalaDto.id_cine !== undefined
              ? BigInt(updateSalaDto.id_cine)
              : undefined,
          filas: updateSalaDto.filas,
          columnas: updateSalaDto.columnas,
        },
        include: { cines: true },
      });
    }

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_EDITAR',
      entidad: 'Sala',
      entidad_id: updated.id,
      detalle: `Sala ${updated.id.toString()} (${updated.nombre}) actualizada`,
      valor_anterior: snapshotSala(prev),
      valor_nuevo: snapshotSala(updated),
    });

    const result = this.toDto(updated);
    if (funcionesActivas > 0) {
      result.warning = `La sala tiene ${funcionesActivas} función(es) activa(s). El cambio de dimensiones puede invalidar reservas existentes.`;
    }

    return result;
  }

  async remove(id: string, auditorId: bigint): Promise<{ id: string }> {
    const salaId = this.parseId(id);
    const existing = await this.prisma.salas.findUnique({
      where: { id: salaId },
      include: { cines: true },
    });
    if (!existing) {
      throw new NotFoundException('Sala no encontrada');
    }

    const funcionesCount = await this.prisma.funciones.count({
      where: { id_sala: salaId },
    });

    if (funcionesCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la sala porque tiene funciones asociadas',
      );
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      await tx.asientosFuncion.deleteMany({
        where: { asientos: { id_sala: salaId } },
      });
      await tx.asientos.deleteMany({ where: { id_sala: salaId } });
      return tx.salas.delete({
        where: { id: salaId },
        select: { id: true },
      });
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_ELIMINAR',
      entidad: 'Sala',
      entidad_id: deleted.id,
      detalle: `Sala ${deleted.id.toString()} (${existing.nombre}) eliminada`,
      valor_anterior: snapshotSala(existing),
    });

    return { id: String(deleted.id) };
  }

  async findAsientos(id: string): Promise<SalaAsientoResponseDto[]> {
    const salaId = this.parseId(id);
    const sala = await this.prisma.salas.findUnique({ where: { id: salaId } });
    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    const asientos = await this.prisma.asientos.findMany({
      where: { id_sala: salaId },
      include: {
        tipoAsiento: { select: { id: true, nombre: true, color: true } },
      },
      orderBy: [{ fila: 'asc' }, { columna: 'asc' }],
    });

    return asientos.map((a) => ({
      id: a.id.toString(),
      fila: a.fila,
      columna: a.columna,
      codigo: a.codigo,
      id_tipo_asiento: a.id_tipo_asiento.toString(),
      tipo: {
        id: a.tipoAsiento.id.toString(),
        nombre: a.tipoAsiento.nombre,
        color: a.tipoAsiento.color ?? null,
      },
    }));
  }

  async updateAsientos(
    id: string,
    dto: UpdateAsientosBatchDto,
    auditorId: bigint,
  ): Promise<UpdateAsientosBatchResponseDto> {
    const salaId = this.parseId(id);
    const sala = await this.prisma.salas.findUnique({ where: { id: salaId } });
    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    const idsAsiento = dto.asignaciones.map((a) => BigInt(a.id_asiento));
    const asientosOwned = await this.prisma.asientos.findMany({
      where: { id: { in: idsAsiento }, id_sala: salaId },
      select: { id: true },
    });
    if (asientosOwned.length !== idsAsiento.length) {
      throw new BadRequestException(
        'Uno o más asientos no pertenecen a esta sala',
      );
    }

    const idsTipo = Array.from(
      new Set(dto.asignaciones.map((a) => BigInt(a.id_tipo_asiento))),
    );
    const tiposFound = await this.prisma.tiposAsiento.findMany({
      where: { id: { in: idsTipo } },
      select: { id: true },
    });
    if (tiposFound.length !== idsTipo.length) {
      throw new BadRequestException('Uno o más tipos de asiento no existen');
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: salaId,
        estado: { in: [FuncionEstado.programada, FuncionEstado.en_curso] },
      },
    });

    await this.prisma.$transaction(
      dto.asignaciones.map((a) =>
        this.prisma.asientos.update({
          where: { id: BigInt(a.id_asiento) },
          data: { id_tipo_asiento: BigInt(a.id_tipo_asiento) },
        }),
      ),
    );

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_ASIENTOS_ACTUALIZAR',
      entidad: 'Sala',
      entidad_id: salaId,
      detalle: `${dto.asignaciones.length} asientos de la sala ${salaId.toString()} actualizados`,
    });

    const warning =
      funcionesActivas > 0
        ? `La sala tiene ${funcionesActivas} función(es) activa(s). El cambio de tipos solo afecta nuevas reservas.`
        : undefined;

    return {
      updated: dto.asignaciones.length,
      ...(warning ? { warning } : {}),
    };
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

  private async assertNombreDisponible(
    nombre: string,
    idCine: bigint,
    excludeId?: bigint,
  ): Promise<void> {
    const existing = await this.prisma.salas.findFirst({
      where: {
        nombre,
        id_cine: idCine,
        ...(excludeId !== undefined ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe una sala con el nombre "${nombre}" en este cine`,
      );
    }
  }
}

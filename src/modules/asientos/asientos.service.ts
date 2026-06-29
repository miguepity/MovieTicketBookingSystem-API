import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { BLOQUEO_DURACION_MINUTOS } from 'src/common/constants/bloqueo.constants';
import { esTipoFueraDeServicio } from 'src/common/constants/tipo-asiento.constants';

@Injectable()
export class AsientosService {
  constructor(private readonly prisma: PrismaService) {}

  async liberarExpirados(): Promise<void> {
    await this.prisma.asientosFuncion.updateMany({
      where: {
        estado: EstadoAsiento.BLOQUEADO,
        bloqueado_hasta: { lt: new Date() },
      },
      data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
    });
  }

  async getMapa(idFuncion: string, idUsuarioActual: string | null) {
    await this.liberarExpirados();

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(idFuncion) },
      include: {
        salas: { select: { filas: true, columnas: true } },
        asientosFuncions: {
          include: {
            asientos: {
              include: { tipoAsiento: { select: { nombre: true } } },
            },
          },
          orderBy: [
            { asientos: { fila: 'asc' } },
            { asientos: { columna: 'asc' } },
          ],
        },
      },
    });

    if (!funcion) {
      throw new NotFoundException({
        code: 'FUNCION_NO_ENCONTRADA',
        message: 'La función no existe',
      });
    }

    const idUsuarioBig = idUsuarioActual ? BigInt(idUsuarioActual) : null;

    return {
      funcion_id: funcion.id.toString(),
      sala: { filas: funcion.salas.filas, columnas: funcion.salas.columnas },
      asientos: funcion.asientosFuncions.map((af) => ({
        id_asiento_funcion: af.id.toString(),
        fila: af.asientos.fila,
        columna: af.asientos.columna,
        codigo: af.asientos.codigo,
        tipo: af.asientos.tipoAsiento.nombre,
        estado: af.estado,
        es_mio: idUsuarioBig !== null && af.id_usuario === idUsuarioBig,
      })),
    };
  }

  async bloquear(
    idFuncion: string,
    idsAsientoFuncion: string[],
    idUsuarioActual: string,
  ): Promise<{ bloqueados: string[]; bloqueado_hasta: string }> {
    await this.liberarExpirados();

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(idFuncion) },
      select: { id: true },
    });
    if (!funcion) {
      throw new NotFoundException({
        code: 'FUNCION_NO_ENCONTRADA',
        message: 'La función no existe',
      });
    }

    const idsBig = idsAsientoFuncion.map((s) => BigInt(s));

    const candidatos = await this.prisma.asientosFuncion.findMany({
      where: { id: { in: idsBig }, id_funcion: funcion.id },
      select: {
        id: true,
        estado: true,
        asientos: { select: { tipoAsiento: { select: { nombre: true } } } },
      },
    });

    if (candidatos.length !== idsBig.length) {
      throw new BadRequestException({
        code: 'ASIENTO_INVALIDO',
        message: 'Uno o más asientos no pertenecen a esta función',
      });
    }

    const fueraDeServicio = candidatos.filter((c) =>
      esTipoFueraDeServicio(c.asientos.tipoAsiento?.nombre),
    );
    if (fueraDeServicio.length > 0) {
      throw new ConflictException({
        code: 'ASIENTO_NO_DISPONIBLE',
        message: 'Uno o más asientos están fuera de servicio',
        ids: fueraDeServicio.map((c) => c.id.toString()),
      });
    }

    const noDisponibles = candidatos.filter(
      (c) => (c.estado as EstadoAsiento) !== EstadoAsiento.DISPONIBLE,
    );
    if (noDisponibles.length > 0) {
      throw new ConflictException({
        code: 'ASIENTO_NO_DISPONIBLE',
        message: 'Uno o más asientos ya no están disponibles',
        ids: noDisponibles.map((c) => c.id.toString()),
      });
    }

    const bloqueadoHasta = new Date(
      Date.now() + BLOQUEO_DURACION_MINUTOS * 60_000,
    );

    const result = await this.prisma.asientosFuncion.updateMany({
      where: { id: { in: idsBig }, estado: EstadoAsiento.DISPONIBLE },
      data: {
        estado: EstadoAsiento.BLOQUEADO,
        id_usuario: BigInt(idUsuarioActual),
        bloqueado_hasta: bloqueadoHasta,
      },
    });

    if (result.count !== idsBig.length) {
      throw new ConflictException({
        code: 'ASIENTO_NO_DISPONIBLE',
        message: 'Carrera perdida: algún asiento se tomó simultáneamente',
      });
    }

    return {
      bloqueados: idsAsientoFuncion,
      bloqueado_hasta: bloqueadoHasta.toISOString(),
    };
  }
}

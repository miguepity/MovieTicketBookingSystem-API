import { Prisma, PagoEstado } from '../../generated/prisma/client';
import { prisma } from './client';
import { EstadoReserva } from '../../src/common/enums/estado-reserva.enum';
import { EstadoAsiento } from '../../src/common/enums/estado-asiento.enum';
import { EstadoReembolso } from '../../src/common/enums/estado-reembolso.enum';
import { MetodoPago } from '../../src/common/enums/metodo-pago.enum';
import type { UsuariosMap } from './usuarios';
import type { FuncionesMap } from './funciones';

const ESTADO_PAGO_PENDIENTE = PagoEstado.procesando;

function suffix(prefix: string, n: number): string {
  return `${prefix}-${n.toString().padStart(4, '0')}`;
}

async function reservaPendientePago(
  cliente: bigint,
  funcionId: bigint,
  numeroReserva: string,
): Promise<bigint | null> {
  const existente = await prisma.reservas.findUnique({
    where: { numero_reserva: numeroReserva },
    select: { id: true },
  });
  if (existente) return existente.id;

  const asientoDisp = await prisma.asientosFuncion.findFirst({
    where: { id_funcion: funcionId, estado: EstadoAsiento.DISPONIBLE },
    select: { id: true },
  });
  if (!asientoDisp) return null;

  const reserva = await prisma.reservas.create({
    data: {
      numero_reserva: numeroReserva,
      id_usuario: cliente,
      id_funcion: funcionId,
      estado: EstadoReserva.PENDIENTE_PAGO,
    },
  });
  await prisma.reservaAsientos.create({
    data: { id_reserva: reserva.id, id_asiento_funcion: asientoDisp.id },
  });
  await prisma.asientosFuncion.update({
    where: { id: asientoDisp.id },
    data: { estado: EstadoAsiento.RESERVADO, id_usuario: cliente },
  });
  return reserva.id;
}

async function pagoPendiente(idReserva: bigint): Promise<void> {
  const existente = await prisma.pagos.findFirst({
    where: { id_reserva: idReserva, estado: ESTADO_PAGO_PENDIENTE },
    select: { id: true },
  });
  if (existente) return;

  await prisma.pagos.create({
    data: {
      id_reserva: idReserva,
      monto_original: new Prisma.Decimal('100.00'),
      monto_descuento: new Prisma.Decimal('0.00'),
      monto_final: new Prisma.Decimal('100.00'),
      metodo: MetodoPago.TARJETA,
      estado: ESTADO_PAGO_PENDIENTE,
    },
  });
}

async function reembolsoPendienteConPolitica(
  idPago: bigint,
  idPolitica: bigint | null,
): Promise<void> {
  const existenteConPolitica = await prisma.reembolsos.findFirst({
    where: {
      id_pago: idPago,
      estado: EstadoReembolso.PENDIENTE,
      id_politica: { not: null },
    },
    select: { id: true },
  });
  if (existenteConPolitica) return;

  const existenteSinPolitica = await prisma.reembolsos.findFirst({
    where: {
      id_pago: idPago,
      estado: EstadoReembolso.PENDIENTE,
      id_politica: null,
    },
    select: { id: true },
  });
  if (existenteSinPolitica) {
    await prisma.reembolsos.update({
      where: { id: existenteSinPolitica.id },
      data: {
        id_politica: idPolitica,
        porcentaje_aplicado: new Prisma.Decimal('50.00'),
        monto: new Prisma.Decimal('50.00'),
      },
    });
    return;
  }

  await prisma.reembolsos.create({
    data: {
      id_pago: idPago,
      id_politica: idPolitica,
      porcentaje_aplicado: new Prisma.Decimal('50.00'),
      monto: new Prisma.Decimal('50.00'),
      estado: EstadoReembolso.PENDIENTE,
    },
  });
}

export async function seedDatosInconclusos(
  usuarios: UsuariosMap,
  funciones: FuncionesMap,
): Promise<void> {
  if (funciones.all.length < 5) return;

  await reservaPendientePago(
    usuarios.cliente.id,
    funciones.all[0].id,
    suffix('RES-INCOMPLETA', 1),
  );
  await reservaPendientePago(
    usuarios.cliente.id,
    funciones.all[1].id,
    suffix('RES-INCOMPLETA', 2),
  );

  const r3 = await reservaPendientePago(
    usuarios.cliente.id,
    funciones.all[2].id,
    suffix('RES-PAGOPEND', 1),
  );
  if (r3) await pagoPendiente(r3);
  const r4 = await reservaPendientePago(
    usuarios.cliente.id,
    funciones.all[3].id,
    suffix('RES-PAGOPEND', 2),
  );
  if (r4) await pagoPendiente(r4);

  const pagosAprobados = await prisma.pagos.findMany({
    where: { estado: PagoEstado.exitoso },
    take: 2,
    include: {
      reservas: {
        select: {
          funciones: { select: { salas: { select: { id_cine: true } } } },
        },
      },
    },
  });
  for (const pago of pagosAprobados) {
    const idCine = pago.reservas.funciones.salas.id_cine;
    const politica = await prisma.politicaCancelacion.findFirst({
      where: { id_cine: idCine, activa: true },
      select: { id: true },
    });
    await reembolsoPendienteConPolitica(pago.id, politica?.id ?? null);
  }
}

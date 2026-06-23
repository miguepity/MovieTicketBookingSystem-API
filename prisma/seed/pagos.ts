import { prisma } from './client';
import { PagoEstado } from '../../generated/prisma/client';
import type { ReservasMap } from './reservas';
import type { CuponesMap } from './cupones';

const METODOS = ['tarjeta', 'paypal', 'efectivo', 'transferencia'];
const ESTADOS: PagoEstado[] = [PagoEstado.exitoso, PagoEstado.rechazado, PagoEstado.procesando];

export interface PagoSeed {
  id: bigint;
  id_reserva: bigint;
  monto_final: number;
  estado: PagoEstado;
}

export interface PagosMap {
  all: PagoSeed[];
}

export async function seedPagos(
  reservas: ReservasMap,
  cupones: CuponesMap,
): Promise<PagosMap> {
  const all: PagoSeed[] = [];

  for (let i = 0; i < reservas.all.length; i++) {
    const reserva = reservas.all[i];
    const existing = await prisma.pagos.findFirst({
      where: { id_reserva: reserva.id },
      select: {
        id: true,
        id_reserva: true,
        monto_final: true,
        estado: true,
      },
    });
    if (existing) {
      all.push({
        id: existing.id,
        id_reserva: existing.id_reserva,
        monto_final: Number(existing.monto_final.toString()),
        estado: existing.estado,
      });
      continue;
    }

    const monto_original = 50 + (i % 5) * 10;
    const usaCupon = i % 3 === 0;
    const cupon = usaCupon ? cupones.all[i % cupones.all.length] : null;
    const monto_descuento = usaCupon ? 5 : 0;
    const monto_final = monto_original - monto_descuento;
    const metodo = METODOS[i % METODOS.length];
    const estado = ESTADOS[i % ESTADOS.length];

    const pago = await prisma.pagos.create({
      data: {
        id_reserva: reserva.id,
        id_cupon: cupon?.id,
        monto_original,
        monto_descuento,
        monto_final,
        metodo,
        estado,
        referencia_externa: `EXT-${(i + 1).toString().padStart(6, '0')}`,
      },
      select: {
        id: true,
        id_reserva: true,
        monto_final: true,
        estado: true,
      },
    });
    all.push({
      id: pago.id,
      id_reserva: pago.id_reserva,
      monto_final: Number(pago.monto_final.toString()),
      estado: pago.estado,
    });
  }

  return { all };
}

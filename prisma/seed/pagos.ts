import { prisma, runSeed, loadReservas, loadCupones } from './_bootstrap';
import { PagoEstado } from '../../generated/prisma/client';
import type { ReservasMap } from './reservas';
import type { CuponesMap } from './cupones';

const METODOS = ['tarjeta', 'paypal', 'efectivo', 'transferencia'];
const ESTADOS: PagoEstado[] = [
  PagoEstado.exitoso,
  PagoEstado.rechazado,
  PagoEstado.procesando,
];

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
  const reservaIds = reservas.all.map((r) => r.id);
  const select = {
    id: true,
    id_reserva: true,
    monto_final: true,
    estado: true,
  };

  const existentesRaw = await prisma.pagos.findMany({
    where: { id_reserva: { in: reservaIds } },
    select,
    orderBy: { id: 'asc' },
  });
  const existentesPorReserva = new Map<
    string,
    (typeof existentesRaw)[number]
  >();
  for (const p of existentesRaw) {
    const k = p.id_reserva.toString();
    if (!existentesPorReserva.has(k)) existentesPorReserva.set(k, p);
  }

  const aCrear: {
    id_reserva: bigint;
    id_cupon: bigint | undefined;
    monto_original: number;
    monto_descuento: number;
    monto_final: number;
    metodo: string;
    estado: PagoEstado;
    referencia_externa: string;
  }[] = [];
  for (let i = 0; i < reservas.all.length; i++) {
    const reserva = reservas.all[i];
    if (existentesPorReserva.has(reserva.id.toString())) continue;
    const monto_original = 50 + (i % 5) * 10;
    const usaCupon = i % 3 === 0;
    const monto_descuento = usaCupon ? 5 : 0;
    aCrear.push({
      id_reserva: reserva.id,
      id_cupon: usaCupon ? cupones.all[i % cupones.all.length].id : undefined,
      monto_original,
      monto_descuento,
      monto_final: monto_original - monto_descuento,
      metodo: METODOS[i % METODOS.length],
      estado: ESTADOS[i % ESTADOS.length],
      referencia_externa: `EXT-${(i + 1).toString().padStart(6, '0')}`,
    });
  }
  if (aCrear.length) await prisma.pagos.createMany({ data: aCrear });

  const todos = await prisma.pagos.findMany({
    where: { id_reserva: { in: reservaIds } },
    select,
    orderBy: { id: 'asc' },
  });
  const porReserva = new Map<string, (typeof todos)[number]>();
  for (const p of todos) {
    const k = p.id_reserva.toString();
    if (!porReserva.has(k)) porReserva.set(k, p);
  }

  const all: PagoSeed[] = [];
  for (const reserva of reservas.all) {
    const pago = porReserva.get(reserva.id.toString());
    if (!pago) continue;
    all.push({
      id: pago.id,
      id_reserva: pago.id_reserva,
      monto_final: Number(pago.monto_final.toString()),
      estado: pago.estado,
    });
  }
  return { all };
}

if (require.main === module) {
  void runSeed('pagos', async (p) => {
    const reservas = await loadReservas(p);
    const cupones = await loadCupones(p);
    await seedPagos(reservas, cupones);
  });
}

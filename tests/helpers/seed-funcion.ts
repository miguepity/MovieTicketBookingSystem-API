import { PrismaClient, PagoEstado } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prismaSingleton: PrismaClient | null = null;

function prisma(): PrismaClient {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  return prismaSingleton;
}

export interface AsientoFuncionLite {
  id: string;
  estado: string;
}

export interface FuncionSeed {
  funcionId: string;
  asientosDisponibles: AsientoFuncionLite[];
}

export async function getFuncionConAsientosLibres(
  cantidadNecesaria: number,
): Promise<FuncionSeed> {
  const funcion = await prisma().funciones.findFirst({
    where: {
      estado: 'programada',
      asientosFuncions: { some: { estado: 'disponible' } },
    },
    orderBy: { id: 'asc' },
    include: {
      asientosFuncions: {
        where: { estado: 'disponible' },
        take: cantidadNecesaria,
      },
    },
  });
  if (!funcion || funcion.asientosFuncions.length < cantidadNecesaria) {
    throw new Error(
      `No hay función con al menos ${cantidadNecesaria} asientos disponibles. Corré pnpm run seed.`,
    );
  }
  return {
    funcionId: funcion.id.toString(),
    asientosDisponibles: funcion.asientosFuncions.map((a) => ({
      id: a.id.toString(),
      estado: a.estado,
    })),
  };
}

export async function resetAsientoFuncion(idAsientoFuncion: string): Promise<void> {
  await prisma().asientosFuncion.update({
    where: { id: BigInt(idAsientoFuncion) },
    data: { estado: 'disponible', id_usuario: null, bloqueado_hasta: new Date() },
  });
}

export async function setBloqueadoHasta(
  idAsientoFuncion: string,
  cuando: Date,
): Promise<void> {
  await prisma().asientosFuncion.update({
    where: { id: BigInt(idAsientoFuncion) },
    data: { bloqueado_hasta: cuando },
  });
}

export interface ReservaSeed {
  numero: string;
  idReserva: string;
  idsAsiento: string[];
}

/**
 * Creates a Reserva in state `pendiente_pago` (or `pagada` when opts.pagada=true)
 * for the given userId, using an available seat from an available function.
 *
 * When opts.pagada=true, also creates a Pagos row with estado='exitoso'.
 *
 * Returns the numero_reserva and the reserva id for use in assertions / cleanup.
 */
export async function seedFuncionConReserva(
  userId: string | bigint,
  opts: { pagada?: boolean } = {},
): Promise<ReservaSeed> {
  const p = prisma();
  const idUsuario = BigInt(userId);

  // Find a function with at least one available seat
  const funcion = await p.funciones.findFirst({
    where: {
      estado: 'programada',
      asientosFuncions: { some: { estado: 'disponible' } },
    },
    orderBy: { id: 'asc' },
    include: {
      salas: { include: { cines: true } },
      asientosFuncions: { where: { estado: 'disponible' }, take: 1 },
    },
  });

  if (!funcion || funcion.asientosFuncions.length === 0) {
    throw new Error(
      'seedFuncionConReserva: no hay función con asientos disponibles. Corré pnpm run seed.',
    );
  }

  const asientoFuncion = funcion.asientosFuncions[0];

  // Generate a unique numero_reserva
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sufijo = Math.random().toString(36).slice(2, 7).toUpperCase();
  const numero = `RES-${fecha}-${sufijo}`;

  const estado = opts.pagada ? 'pagada' : 'pendiente_pago';

  const reserva = await p.reservas.create({
    data: {
      numero_reserva: numero,
      id_usuario: idUsuario,
      id_funcion: funcion.id,
      estado,
      reservaAsientos: {
        create: { id_asiento_funcion: asientoFuncion.id },
      },
    },
  });

  // Mark asiento as reservado
  await p.asientosFuncion.update({
    where: { id: asientoFuncion.id },
    data: { estado: 'reservado', id_usuario: idUsuario },
  });

  // Optionally create a pago exitoso
  if (opts.pagada) {
    // Get the cinema's price for this seat type to use as monto_final
    const asientoDetalle = await p.asientosFuncion.findUnique({
      where: { id: asientoFuncion.id },
      include: { asientos: { select: { id_tipo_asiento: true } } },
    });
    const idTipoAsiento = asientoDetalle?.asientos.id_tipo_asiento;
    const precioCine = idTipoAsiento
      ? await p.preciosCine.findFirst({
          where: { id_cine: funcion.salas.id_cine, id_tipo_asiento: idTipoAsiento },
        })
      : null;
    const monto = precioCine ? precioCine.precio : 10.0;

    await p.pagos.create({
      data: {
        id_reserva: reserva.id,
        monto_original: monto,
        monto_descuento: 0,
        monto_final: monto,
        metodo: 'tarjeta',
        estado: PagoEstado.exitoso,
      },
    });
  }

  return {
    numero,
    idReserva: reserva.id.toString(),
    idsAsiento: [asientoFuncion.id.toString()],
  };
}

/**
 * Cleanup helper: resets a reserva created by seedFuncionConReserva.
 * Deletes the reserva (cascade deletes reserva_asientos) and resets the asiento estado.
 */
export async function cleanupReservaSeed(seed: ReservaSeed): Promise<void> {
  const p = prisma();
  // Delete reembolsos first (FK to pagos with ON DELETE RESTRICT)
  await p.reembolsos.deleteMany({ where: { pagos: { id_reserva: BigInt(seed.idReserva) } } });
  // Delete pagos second (foreign key)
  await p.pagos.deleteMany({ where: { id_reserva: BigInt(seed.idReserva) } });
  // Delete reserva_asientos
  await p.reservaAsientos.deleteMany({ where: { id_reserva: BigInt(seed.idReserva) } });
  // Delete reserva
  await p.reservas.delete({ where: { id: BigInt(seed.idReserva) } }).catch(() => {});
  // Reset asientos
  for (const idAsiento of seed.idsAsiento) {
    await resetAsientoFuncion(idAsiento);
  }
}

import {
  prisma,
  runSeed,
  loadReservas,
  loadAsientosFuncion,
} from './_bootstrap';
import type { ReservasMap } from './reservas';
import type { AsientosFuncionMap } from './asientos-funcion';

export async function seedReservaAsientos(
  reservas: ReservasMap,
  asientosFuncion: AsientosFuncionMap,
): Promise<void> {
  for (let i = 0; i < reservas.all.length; i++) {
    const reserva = reservas.all[i];
    const existingCount = await prisma.reservaAsientos.count({
      where: { id_reserva: reserva.id },
    });
    if (existingCount > 0) continue;

    const candidatos = asientosFuncion.all.filter(
      (a) => a.id_funcion === reserva.id_funcion,
    );
    if (candidatos.length === 0) continue;

    const offset = (i * 2) % Math.max(candidatos.length - 1, 1);
    const seleccionados = candidatos.slice(offset, offset + 2);

    await prisma.reservaAsientos.createMany({
      data: seleccionados.map((a) => ({
        id_reserva: reserva.id,
        id_asiento_funcion: a.id,
      })),
    });
  }
}

if (require.main === module) {
  void runSeed('reserva-asientos', async (p) => {
    const reservas = await loadReservas(p);
    const asientosFuncion = await loadAsientosFuncion(p);
    await seedReservaAsientos(reservas, asientosFuncion);
  });
}

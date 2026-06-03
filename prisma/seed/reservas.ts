import { prisma } from './client';
import type { UsuariosMap } from './usuarios';
import type { FuncionesMap } from './funciones';

const ESTADOS = ['confirmada', 'pendiente', 'cancelada'];

export interface ReservaSeed {
  id: bigint;
  numero_reserva: string;
  id_funcion: bigint;
  estado: string;
}

export interface ReservasMap {
  all: ReservaSeed[];
}

export async function seedReservas(
  usuarios: UsuariosMap,
  funciones: FuncionesMap,
): Promise<ReservasMap> {
  const all: ReservaSeed[] = [];

  for (let i = 0; i < 30; i++) {
    const numero_reserva = `R-${(i + 1).toString().padStart(5, '0')}`;
    const usuario = usuarios.all[i % usuarios.all.length];
    const funcion = funciones.all[i % funciones.all.length];
    const estado = ESTADOS[i % ESTADOS.length];

    const reserva = await prisma.reservas.upsert({
      where: { numero_reserva },
      update: {},
      create: {
        numero_reserva,
        id_usuario: usuario.id,
        id_funcion: funcion.id,
        estado,
      },
      select: {
        id: true,
        numero_reserva: true,
        id_funcion: true,
        estado: true,
      },
    });
    all.push(reserva);
  }

  return { all };
}

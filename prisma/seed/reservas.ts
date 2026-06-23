import { prisma } from './client';
import { ReservaEstado } from '../../generated/prisma/client';
import type { UsuariosMap } from './usuarios';
import type { FuncionesMap } from './funciones';

const ESTADOS: ReservaEstado[] = [ReservaEstado.pagada, ReservaEstado.pendiente_pago, ReservaEstado.cancelada];

const NOTAS_INTERNAS = [
  'Cliente VIP',
  'Asiento reasignado por queja',
  'Pagó en mostrador, ajustar inventario',
  'Solicitud de factura pendiente',
  'Cambio de función autorizado por supervisor',
  'Cliente solicitó reembolso parcial',
];

export interface ReservaSeed {
  id: bigint;
  numero_reserva: string;
  id_funcion: bigint;
  estado: ReservaEstado;
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

    const expira_en =
      estado === ReservaEstado.pendiente_pago
        ? new Date(Date.now() + 10 * 60 * 1000)
        : undefined;
    const notas_internas =
      i % 5 === 0
        ? NOTAS_INTERNAS[i % NOTAS_INTERNAS.length]
        : undefined;

    const reserva = await prisma.reservas.upsert({
      where: { numero_reserva },
      update: {},
      create: {
        numero_reserva,
        id_usuario: usuario.id,
        id_funcion: funcion.id,
        estado,
        ...(expira_en !== undefined && { expira_en }),
        ...(notas_internas !== undefined && { notas_internas }),
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

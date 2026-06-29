import { prisma, runSeed, loadUsuarios, loadFunciones } from './_bootstrap';
import { ReservaEstado } from '../../generated/prisma/client';
import type { UsuariosMap } from './usuarios';
import type { FuncionesMap } from './funciones';

const ESTADOS: ReservaEstado[] = [
  ReservaEstado.pagada,
  ReservaEstado.pendiente_pago,
  ReservaEstado.cancelada,
];

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
  type ReservaCreate = {
    numero_reserva: string;
    id_usuario: bigint;
    id_funcion: bigint;
    estado: ReservaEstado;
    expira_en?: Date;
    notas_internas?: string;
  };

  const candidatos: ReservaCreate[] = [];
  for (let i = 0; i < 30; i++) {
    const estado = ESTADOS[i % ESTADOS.length];
    candidatos.push({
      numero_reserva: `RES-20260101-${(i + 1).toString().padStart(5, '0')}`,
      id_usuario: usuarios.all[i % usuarios.all.length].id,
      id_funcion: funciones.all[i % funciones.all.length].id,
      estado,
      ...(estado === ReservaEstado.pendiente_pago && {
        expira_en: new Date(Date.now() + 10 * 60 * 1000),
      }),
      ...(i % 5 === 0 && {
        notas_internas: NOTAS_INTERNAS[i % NOTAS_INTERNAS.length],
      }),
    });
  }

  const numeros = candidatos.map((c) => c.numero_reserva);
  const select = {
    id: true,
    numero_reserva: true,
    id_funcion: true,
    estado: true,
  };

  const existentes = await prisma.reservas.findMany({
    where: { numero_reserva: { in: numeros } },
    select: { numero_reserva: true },
  });
  const existentesSet = new Set(existentes.map((e) => e.numero_reserva));
  const aCrear = candidatos.filter((c) => !existentesSet.has(c.numero_reserva));
  if (aCrear.length) {
    await prisma.reservas.createMany({ data: aCrear, skipDuplicates: true });
  }

  const todos = await prisma.reservas.findMany({
    where: { numero_reserva: { in: numeros } },
    select,
  });
  const orden = new Map(candidatos.map((c, i) => [c.numero_reserva, i]));
  todos.sort(
    (a, b) =>
      (orden.get(a.numero_reserva) ?? 0) - (orden.get(b.numero_reserva) ?? 0),
  );

  return { all: todos };
}

if (require.main === module) {
  void runSeed('reservas', async (p) => {
    const usuarios = await loadUsuarios(p);
    const funciones = await loadFunciones(p);
    await seedReservas(usuarios, funciones);
  });
}

import { PrismaClient } from '../../generated/prisma/client';
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

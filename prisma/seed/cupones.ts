import { prisma } from './client';

const CUPONES: ReadonlyArray<{
  codigo: string;
  tipo: string;
  valor: number;
  dias_expira: number;
  usos_maximos: number | null;
}> = [
  {
    codigo: 'BIENVENIDA10',
    tipo: 'porcentaje',
    valor: 10,
    dias_expira: 90,
    usos_maximos: 1000,
  },
  {
    codigo: 'VERANO20',
    tipo: 'porcentaje',
    valor: 20,
    dias_expira: 60,
    usos_maximos: 500,
  },
  {
    codigo: 'ESTRENO5',
    tipo: 'monto',
    valor: 5,
    dias_expira: 30,
    usos_maximos: 200,
  },
  {
    codigo: 'FAMILIA15',
    tipo: 'porcentaje',
    valor: 15,
    dias_expira: 120,
    usos_maximos: 300,
  },
  {
    codigo: 'ESTUDIANTE25',
    tipo: 'porcentaje',
    valor: 25,
    dias_expira: 180,
    usos_maximos: null,
  },
  {
    codigo: 'NAVIDAD30',
    tipo: 'porcentaje',
    valor: 30,
    dias_expira: 45,
    usos_maximos: 1000,
  },
  {
    codigo: 'CUMPLE50',
    tipo: 'monto',
    valor: 50,
    dias_expira: 30,
    usos_maximos: 100,
  },
  {
    codigo: 'MARTES2X1',
    tipo: 'porcentaje',
    valor: 50,
    dias_expira: 90,
    usos_maximos: null,
  },
  {
    codigo: 'COMBO10',
    tipo: 'monto',
    valor: 10,
    dias_expira: 60,
    usos_maximos: 400,
  },
  {
    codigo: 'PREMIER40',
    tipo: 'porcentaje',
    valor: 40,
    dias_expira: 14,
    usos_maximos: 50,
  },
];

export interface CuponSeed {
  id: bigint;
  codigo: string;
}

export interface CuponesMap {
  all: CuponSeed[];
}

export async function seedCupones(): Promise<CuponesMap> {
  const all: CuponSeed[] = [];
  const now = Date.now();
  for (const c of CUPONES) {
    const cupon = await prisma.cupones.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: c.valor,
        fecha_expiracion: new Date(now + c.dias_expira * 86400 * 1000),
        usos_maximos: c.usos_maximos,
      },
      select: { id: true, codigo: true },
    });
    all.push(cupon);
  }
  return { all };
}

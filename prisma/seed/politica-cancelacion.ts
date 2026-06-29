import { prisma, runSeed, loadCines } from './_bootstrap';
import type { CinesMap } from './cines';

const REGLAS_DEFAULT: ReadonlyArray<{
  horas_antes_minimo: number;
  horas_antes_maximo: number | null;
  porcentaje_reembolso: number;
}> = [
  { horas_antes_minimo: 0, horas_antes_maximo: 1, porcentaje_reembolso: 0 },
  { horas_antes_minimo: 1, horas_antes_maximo: 2, porcentaje_reembolso: 10 },
  { horas_antes_minimo: 2, horas_antes_maximo: 4, porcentaje_reembolso: 25 },
  { horas_antes_minimo: 4, horas_antes_maximo: 6, porcentaje_reembolso: 40 },
  { horas_antes_minimo: 6, horas_antes_maximo: 12, porcentaje_reembolso: 50 },
  { horas_antes_minimo: 12, horas_antes_maximo: 24, porcentaje_reembolso: 60 },
  { horas_antes_minimo: 24, horas_antes_maximo: 48, porcentaje_reembolso: 75 },
  { horas_antes_minimo: 48, horas_antes_maximo: 72, porcentaje_reembolso: 85 },
  { horas_antes_minimo: 72, horas_antes_maximo: 168, porcentaje_reembolso: 95 },
  {
    horas_antes_minimo: 168,
    horas_antes_maximo: null,
    porcentaje_reembolso: 100,
  },
];

export async function seedPoliticaCancelacion(cines: CinesMap): Promise<void> {
  for (const cine of cines.all) {
    const existing = await prisma.politicaCancelacion.findFirst({
      where: { id_cine: cine.id, activa: true },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.politicaCancelacion.create({
      data: {
        id_cine: cine.id,
        nombre: `Política base ${cine.nombre}`,
        activa: true,
        reglas: {
          create: REGLAS_DEFAULT.map((r) => ({
            horas_antes_minimo: r.horas_antes_minimo,
            horas_antes_maximo: r.horas_antes_maximo,
            porcentaje_reembolso: r.porcentaje_reembolso,
          })),
        },
      },
    });
  }
}

if (require.main === module) {
  void runSeed('politica-cancelacion', async (p) => {
    const cines = await loadCines(p);
    await seedPoliticaCancelacion(cines);
  });
}

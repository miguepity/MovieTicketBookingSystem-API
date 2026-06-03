import { prisma } from './client';
import type { PagosMap } from './pagos';

export async function seedReembolsos(pagos: PagosMap): Promise<void> {
  const aprobados = pagos.all.filter((p) => p.estado === 'aprobado');
  const target = Math.min(10, aprobados.length);

  for (let i = 0; i < target; i++) {
    const pago = aprobados[i];
    const existing = await prisma.reembolsos.findFirst({
      where: { id_pago: pago.id },
      select: { id: true },
    });
    if (existing) continue;

    const monto = pago.monto_final * 0.5;
    const estado = i % 3 === 0 ? 'procesado' : 'pendiente';
    await prisma.reembolsos.create({
      data: {
        id_pago: pago.id,
        monto,
        estado,
        fecha_procesado: estado === 'procesado' ? new Date() : null,
      },
    });
  }
}

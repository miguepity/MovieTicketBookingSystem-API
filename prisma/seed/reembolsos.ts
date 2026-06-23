import { ReembolsoEstado, PagoEstado } from '../../generated/prisma/client';
import { prisma } from './client';
import type { PagosMap } from './pagos';

export async function seedReembolsos(pagos: PagosMap): Promise<void> {
  const aprobados = pagos.all.filter((p) => p.estado === PagoEstado.exitoso);
  const target = Math.min(10, aprobados.length);

  for (let i = 0; i < target; i++) {
    const pago = aprobados[i];
    const existing = await prisma.reembolsos.findFirst({
      where: { id_pago: pago.id },
      select: { id: true },
    });
    if (existing) continue;

    const monto = pago.monto_final * 0.5;
    const estado: ReembolsoEstado = i % 3 === 0 ? ReembolsoEstado.procesado : ReembolsoEstado.pendiente;
    await prisma.reembolsos.create({
      data: {
        id_pago: pago.id,
        monto,
        estado,
        fecha_procesado: estado === ReembolsoEstado.procesado ? new Date() : null,
      },
    });
  }
}

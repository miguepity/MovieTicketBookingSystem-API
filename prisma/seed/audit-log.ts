import { prisma } from './client';
import type { UsuariosMap } from './usuarios';

const ACCIONES = [
  'login',
  'logout',
  'crear_pelicula',
  'editar_pelicula',
  'eliminar_pelicula',
  'crear_funcion',
  'cancelar_reserva',
  'aprobar_pago',
  'rechazar_pago',
  'crear_cupon',
  'editar_cupon',
  'crear_usuario',
];

export async function seedAuditLog(usuarios: UsuariosMap): Promise<void> {
  const auditor = usuarios.admin;

  for (let i = 0; i < ACCIONES.length; i++) {
    const accion = ACCIONES[i];
    const usuario = usuarios.all[i % usuarios.all.length];

    const existing = await prisma.auditLog.findFirst({
      where: { accion, id_usuario: usuario.id, id_auditor: auditor.id },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.auditLog.create({
      data: {
        id_usuario: usuario.id,
        id_auditor: auditor.id,
        accion,
        detalle: `Acción ${accion} ejecutada por ${usuario.email}`,
      },
    });
  }
}

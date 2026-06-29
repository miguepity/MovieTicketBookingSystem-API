import { prisma, runSeed, loadUsuarios } from './_bootstrap';
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
  const candidatos = ACCIONES.map((accion, i) => {
    const usuario = usuarios.all[i % usuarios.all.length];
    return {
      accion,
      id_usuario: usuario.id,
      id_auditor: auditor.id,
      detalle: `Acción ${accion} ejecutada por ${usuario.email}`,
    };
  });

  const key = (a: string, u: bigint, au: bigint) => `${a}|${u}|${au}`;
  const existentes = await prisma.auditLog.findMany({
    where: {
      OR: candidatos.map((c) => ({
        accion: c.accion,
        id_usuario: c.id_usuario,
        id_auditor: c.id_auditor,
      })),
    },
    select: { accion: true, id_usuario: true, id_auditor: true },
  });
  const existentesSet = new Set(
    existentes.map((e) => key(e.accion, e.id_usuario, e.id_auditor)),
  );
  const aCrear = candidatos.filter(
    (c) => !existentesSet.has(key(c.accion, c.id_usuario, c.id_auditor)),
  );
  if (aCrear.length) await prisma.auditLog.createMany({ data: aCrear });
}

if (require.main === module) {
  void runSeed('audit-log', async (p) => {
    const usuarios = await loadUsuarios(p);
    await seedAuditLog(usuarios);
  });
}

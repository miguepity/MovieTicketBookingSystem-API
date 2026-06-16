// Excluye password_hash deliberadamente: nunca debe persistirse en bitacoras.
export type UsuarioSnapshot = {
  nombre: string;
  email: string;
  id_rol: string;
  rol_nombre: string;
  estado: string;
  notificaciones_activas: boolean;
};

type UsuarioInput = {
  nombre: string;
  email: string;
  id_rol: bigint;
  estado: string;
  notificaciones_activas: boolean;
  roles: { nombre: string };
};

export function snapshotUsuario(u: UsuarioInput): UsuarioSnapshot {
  return {
    nombre: u.nombre,
    email: u.email,
    id_rol: u.id_rol.toString(),
    rol_nombre: u.roles.nombre,
    estado: u.estado,
    notificaciones_activas: u.notificaciones_activas,
  };
}

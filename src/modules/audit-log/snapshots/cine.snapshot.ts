export type CineSnapshot = {
  nombre: string;
  direccion: string | null;
  id_ciudad: string;
  ciudad_nombre: string;
  activo: boolean;
};

type CineInput = {
  nombre: string;
  direccion: string | null;
  id_ciudad: bigint;
  activo: boolean;
  ciudades: { nombre: string };
};

export function snapshotCine(c: CineInput): CineSnapshot {
  return {
    nombre: c.nombre,
    direccion: c.direccion,
    id_ciudad: c.id_ciudad.toString(),
    ciudad_nombre: c.ciudades.nombre,
    activo: c.activo,
  };
}

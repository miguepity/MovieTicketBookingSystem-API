export type PoliticaCancelacionSnapshot = {
  nombre: string;
  activa: boolean;
  id_cine: string;
};

type PoliticaInput = {
  nombre: string;
  activa: boolean;
  id_cine: bigint;
};

export function snapshotPoliticaCancelacion(p: PoliticaInput): PoliticaCancelacionSnapshot {
  return {
    nombre: p.nombre,
    activa: p.activa,
    id_cine: p.id_cine.toString(),
  };
}

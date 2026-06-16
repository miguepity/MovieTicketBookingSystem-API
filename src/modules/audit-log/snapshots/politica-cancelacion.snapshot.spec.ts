import { snapshotPoliticaCancelacion } from './politica-cancelacion.snapshot';

describe('snapshotPoliticaCancelacion', () => {
  it('mapea los campos editables', () => {
    const p = { id: 1n, nombre: 'Hasta 24h antes', activa: true, id_cine: 2n };
    expect(snapshotPoliticaCancelacion(p as any)).toEqual({
      nombre: 'Hasta 24h antes',
      activa: true,
      id_cine: '2',
    });
  });
});

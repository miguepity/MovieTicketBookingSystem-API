import { snapshotPrecioCine } from './precio-cine.snapshot';

describe('snapshotPrecioCine', () => {
  it('mapea por JOIN, precio como string', () => {
    const p = {
      id: 1n,
      id_cine: 1n,
      id_tipo_asiento: 2n,
      precio: '45.00',
      cines: { nombre: 'CC Miraflores' },
      tipoAsiento: { nombre: 'VIP' },
    };
    expect(snapshotPrecioCine(p as any)).toEqual({
      cine_nombre: 'CC Miraflores',
      tipo_asiento_nombre: 'VIP',
      precio: '45.00',
    });
  });
});

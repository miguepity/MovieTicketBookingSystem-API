import { snapshotTipoAsiento } from './tipo-asiento.snapshot';

describe('snapshotTipoAsiento', () => {
  it('extrae solo el nombre', () => {
    expect(snapshotTipoAsiento({ id: 1n, nombre: 'VIP' } as any)).toEqual({ nombre: 'VIP' });
  });
});

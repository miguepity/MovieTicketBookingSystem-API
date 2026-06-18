import { snapshotTipoAsiento } from './tipo-asiento.snapshot';

describe('snapshotTipoAsiento', () => {
  it('extrae nombre y color', () => {
    expect(
      snapshotTipoAsiento({ id: 1n, nombre: 'VIP', color: '#FF8800' } as any),
    ).toEqual({ nombre: 'VIP', color: '#FF8800' });
  });

  it('normaliza color ausente a null', () => {
    expect(snapshotTipoAsiento({ id: 1n, nombre: 'VIP' } as any)).toEqual({
      nombre: 'VIP',
      color: null,
    });
  });
});

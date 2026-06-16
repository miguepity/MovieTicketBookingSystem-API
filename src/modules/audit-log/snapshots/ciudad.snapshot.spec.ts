import { snapshotCiudad } from './ciudad.snapshot';

describe('snapshotCiudad', () => {
  it('extrae solo el nombre', () => {
    expect(snapshotCiudad({ id: 1n, nombre: 'Guatemala' } as any)).toEqual({ nombre: 'Guatemala' });
  });
});

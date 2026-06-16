import { snapshotGenero } from './genero.snapshot';

describe('snapshotGenero', () => {
  it('extrae solo el nombre', () => {
    expect(snapshotGenero({ id: 1n, nombre: 'Acción' } as any)).toEqual({ nombre: 'Acción' });
  });
});

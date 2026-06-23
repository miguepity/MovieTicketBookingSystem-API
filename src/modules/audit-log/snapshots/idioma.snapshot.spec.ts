import { snapshotIdioma } from './idioma.snapshot';

describe('snapshotIdioma', () => {
  it('extrae solo el nombre', () => {
    expect(snapshotIdioma({ id: 1n, nombre: 'Español' } as any)).toEqual({
      nombre: 'Español',
    });
  });
});

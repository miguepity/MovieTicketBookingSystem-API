import { snapshotSala } from './sala.snapshot';

describe('snapshotSala', () => {
  it('calcula capacidad = filas × columnas', () => {
    const s = {
      id: 3n,
      nombre: 'Sala 3',
      id_cine: 1n,
      filas: 10,
      columnas: 12,
      cines: { nombre: 'CC Miraflores' },
    };
    expect(snapshotSala(s as any)).toEqual({
      nombre: 'Sala 3',
      id_cine: '1',
      cine_nombre: 'CC Miraflores',
      filas: 10,
      columnas: 12,
      capacidad: 120,
    });
  });
});

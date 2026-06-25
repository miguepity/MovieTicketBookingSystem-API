import { snapshotCine } from './cine.snapshot';

describe('snapshotCine', () => {
  it('mapea campos + ciudad_nombre por JOIN', () => {
    const c = {
      id: 1n,
      nombre: 'CC Miraflores',
      direccion: 'Anillo Periférico',
      id_ciudad: 2n,
      activo: true,
      ciudades: { nombre: 'Guatemala' },
    };
    expect(snapshotCine(c as any)).toEqual({
      nombre: 'CC Miraflores',
      direccion: 'Anillo Periférico',
      id_ciudad: '2',
      ciudad_nombre: 'Guatemala',
      activo: true,
    });
  });

  it('soporta dirección null', () => {
    const c = {
      nombre: 'X',
      direccion: null,
      id_ciudad: 1n,
      ciudades: { nombre: 'Y' },
    };
    expect(snapshotCine(c as any).direccion).toBeNull();
  });
});

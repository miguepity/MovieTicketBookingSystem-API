import { snapshotCupon } from './cupon.snapshot';

describe('snapshotCupon', () => {
  it('mapea cupon a snapshot sin usos_actuales', () => {
    const c = {
      codigo: 'PROMO10',
      tipo: 'PORCENTAJE',
      valor: '10.00',
      fecha_expiracion: new Date('2026-12-31T00:00:00Z'),
      usos_maximos: 100,
      usos_actuales: 42,
      activo: true,
    };
    const snap = snapshotCupon(c);
    expect(snap).toEqual({
      codigo: 'PROMO10',
      tipo: 'PORCENTAJE',
      valor: '10.00',
      fecha_expiracion: '2026-12-31',
      usos_maximos: 100,
      activo: true,
    });
    expect(snap).not.toHaveProperty('usos_actuales');
  });

  it('soporta usos_maximos null', () => {
    const c = {
      codigo: 'ILIMITADO',
      tipo: 'FIJO',
      valor: '5.00',
      fecha_expiracion: new Date('2027-01-15T00:00:00Z'),
      usos_maximos: null,
      activo: false,
    };
    expect(snapshotCupon(c as any).usos_maximos).toBeNull();
  });
});

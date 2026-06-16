import { snapshotReembolso } from './reembolso.snapshot';

describe('snapshotReembolso', () => {
  it('mapea reembolso procesado con politica', () => {
    const r = {
      id_pago: 200n,
      monto: '15.00',
      porcentaje_aplicado: '50.00',
      estado: 'PROCESADO',
      id_politica: 3n,
      fecha_procesado: new Date('2026-06-10T10:00:00Z'),
    };
    expect(snapshotReembolso(r as any)).toEqual({
      id_pago: '200',
      monto: '15.00',
      porcentaje_aplicado: '50.00',
      estado: 'PROCESADO',
      id_politica: '3',
      fecha_procesado: '2026-06-10T10:00:00.000Z',
    });
  });

  it('mapea reembolso pendiente sin politica ni fecha', () => {
    const r = {
      id_pago: 201n,
      monto: '0.00',
      porcentaje_aplicado: '0.00',
      estado: 'PENDIENTE',
      id_politica: null,
      fecha_procesado: null,
    };
    const snap = snapshotReembolso(r as any);
    expect(snap.id_politica).toBeNull();
    expect(snap.fecha_procesado).toBeNull();
  });
});

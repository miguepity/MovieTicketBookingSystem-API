import { snapshotPago } from './pago.snapshot';

describe('snapshotPago', () => {
  it('mapea pago con cupon y datos de tarjeta enmascarados', () => {
    const p = {
      id_reserva: 100n,
      monto_original: '50.00',
      monto_descuento: '5.00',
      monto_final: '45.00',
      metodo: 'TARJETA',
      estado: 'APROBADO',
      marca_snapshot: 'VISA',
      ultimos4_snapshot: '4242',
      referencia_externa: 'STRIPE_abc123',
      id_cupon: 9n,
      reservas: { numero_reserva: 'RSV-000100' },
    };
    expect(snapshotPago(p as any)).toEqual({
      id_reserva: '100',
      numero_reserva: 'RSV-000100',
      monto_original: '50.00',
      monto_descuento: '5.00',
      monto_final: '45.00',
      metodo: 'TARJETA',
      estado: 'APROBADO',
      marca_snapshot: 'VISA',
      ultimos4_snapshot: '4242',
      referencia_externa: 'STRIPE_abc123',
      id_cupon: '9',
    });
  });

  it('mapea pago sin cupon ni referencia', () => {
    const p = {
      id_reserva: 101n,
      monto_original: '20.00',
      monto_descuento: '0.00',
      monto_final: '20.00',
      metodo: 'EFECTIVO',
      estado: 'PENDIENTE',
      marca_snapshot: null,
      ultimos4_snapshot: null,
      referencia_externa: null,
      id_cupon: null,
      reservas: { numero_reserva: 'RSV-000101' },
    };
    const snap = snapshotPago(p as any);
    expect(snap.id_cupon).toBeNull();
    expect(snap.referencia_externa).toBeNull();
    expect(snap.marca_snapshot).toBeNull();
  });
});

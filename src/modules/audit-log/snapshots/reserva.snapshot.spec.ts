import { snapshotReserva } from './reserva.snapshot';

describe('snapshotReserva', () => {
  it('mapea reserva con asientos y total agregado', () => {
    const r = {
      numero_reserva: 'RSV-000123',
      id_usuario: 7n,
      id_funcion: 42n,
      estado: 'CONFIRMADA',
      usuarios: { nombre: 'Grace Hopper' },
      funciones: {
        fecha_hora: new Date('2026-07-01T18:30:00Z'),
        peliculas: { titulo: 'Dune' },
        salas: { nombre: 'Sala IMAX' },
      },
      reservaAsientos: [
        { asientosfuncion: { asientos: { fila: 'A', columna: 1 } } },
        { asientosfuncion: { asientos: { fila: 'A', columna: 2 } } },
      ],
      pagos: [{ monto_final: '25.50' }, { monto_final: '4.50' }],
    };
    expect(snapshotReserva(r as any)).toEqual({
      numero_reserva: 'RSV-000123',
      id_usuario: '7',
      usuario_nombre: 'Grace Hopper',
      id_funcion: '42',
      funcion_label: 'Dune · Sala IMAX · 2026-07-01T18:30:00.000Z',
      estado: 'CONFIRMADA',
      asientos: ['A1', 'A2'],
      total: '30.00',
    });
  });

  it('total es 0.00 cuando no hay pagos', () => {
    const r = {
      numero_reserva: 'RSV-000999',
      id_usuario: 1n,
      id_funcion: 1n,
      estado: 'PENDIENTE',
      usuarios: { nombre: 'Anon' },
      funciones: {
        fecha_hora: new Date('2026-07-01T18:30:00Z'),
        peliculas: { titulo: 'X' },
        salas: { nombre: 'S1' },
      },
      reservaAsientos: [],
      pagos: [],
    };
    expect(snapshotReserva(r as any).total).toBe('0.00');
    expect(snapshotReserva(r as any).asientos).toEqual([]);
  });
});

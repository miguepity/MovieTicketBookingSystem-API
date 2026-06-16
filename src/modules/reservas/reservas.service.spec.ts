import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReservasService } from './reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ReembolsosService } from '../reembolsos/reembolsos.service';

describe('ReservasService.cancelar', () => {
  let service: ReservasService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };
  let reembolsos: { calcularMonto: jest.Mock; crearReembolso: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      reservas: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        updateMany: jest.fn(),
      },
      asientosFuncion: { updateMany: jest.fn() },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(prisma)),
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    reembolsos = {
      calcularMonto: jest.fn(),
      crearReembolso: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: ReembolsosService, useValue: reembolsos },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();
    service = moduleRef.get(ReservasService);
  });

  it('registra audit RESERVA_CANCELAR con valor_anterior snapshot', async () => {
    const baseReserva = {
      id: 5n,
      id_usuario: 9n,
      id_funcion: 2n,
      numero_reserva: 'RES-20260101-ABCDE',
      estado: 'pagada',
      reservaAsientos: [{ id_asiento_funcion: 11n }],
    };
    prisma.reservas.findUnique.mockResolvedValueOnce(baseReserva);
    reembolsos.calcularMonto.mockResolvedValueOnce({
      pagoId: null,
      monto: 0,
      porcentaje: 0,
      politicaId: null,
    });
    // prevReserva con include pesado
    prisma.reservas.findUniqueOrThrow.mockResolvedValueOnce({
      ...baseReserva,
      usuarios: { nombre: 'Juan' },
      funciones: {
        fecha_hora: new Date('2026-02-01T20:00:00.000Z'),
        peliculas: { titulo: 'Movie' },
        salas: { nombre: 'Sala 1' },
      },
      reservaAsientos: [
        {
          asientosfuncion: { asientos: { fila: 'A', columna: 1 } },
        },
      ],
      pagos: [],
    });
    // dentro de la transacción: claim + refreshed
    prisma.reservas.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.reservas.findUniqueOrThrow.mockResolvedValueOnce({
      id: 5n,
      id_usuario: 9n,
      estado: 'cancelada',
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    });

    await service.cancelar('5', '9');

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'RESERVA_CANCELAR',
        entidad: 'Reserva',
        entidad_id: 5n,
        valor_anterior: expect.objectContaining({
          numero_reserva: 'RES-20260101-ABCDE',
          estado: 'pagada',
          asientos: ['A1'],
        }),
      }),
    );
  });
});

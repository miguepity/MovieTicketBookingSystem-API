import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PagosService } from './pagos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MetodoPago } from '../../common/enums/metodo-pago.enum';

describe('PagosService.crear', () => {
  let service: PagosService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      reservas: { findUnique: jest.fn() },
      preciosCine: { findMany: jest.fn() },
      pagos: { create: jest.fn(), findUniqueOrThrow: jest.fn() },
      asientosFuncion: { updateMany: jest.fn() },
      cupones: { update: jest.fn() },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(prisma)),
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    eventEmitter = { emit: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();
    service = moduleRef.get(PagosService);
  });

  it('registra audit PAGO_APROBAR con valor_nuevo en estado aprobado', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      id: 5n,
      id_usuario: 9n,
      numero_reserva: 'RES-20260101-ABCDE',
      estado: 'pendiente_pago',
      funciones: { salas: { id_cine: 1n } },
      reservaAsientos: [
        {
          id: 100n,
          asientosfuncion: {
            id: 11n,
            asientos: {
              id_tipo_asiento: 1n,
              tipoAsiento: { nombre: 'estandar' },
            },
          },
        },
      ],
    });
    prisma.preciosCine.findMany.mockResolvedValueOnce([
      { id_tipo_asiento: 1n, precio: { toString: () => '100' } },
    ]);
    prisma.reservas.updateMany = jest.fn().mockResolvedValueOnce({ count: 1 });
    prisma.pagos.create.mockResolvedValueOnce({
      id: 42n,
      estado: 'aprobado',
      monto_original: { toString: () => '100.00' },
      monto_descuento: { toString: () => '0.00' },
      monto_final: { toString: () => '100.00' },
    });
    prisma.pagos.findUniqueOrThrow.mockResolvedValueOnce({
      id: 42n,
      id_reserva: 5n,
      monto_original: '100.00',
      monto_descuento: '0.00',
      monto_final: '100.00',
      metodo: 'tarjeta',
      estado: 'aprobado',
      marca_snapshot: null,
      ultimos4_snapshot: null,
      referencia_externa: null,
      id_cupon: null,
      reservas: { numero_reserva: 'RES-20260101-ABCDE' },
    });

    await service.crear({
      idReserva: '5',
      idUsuarioActual: '9',
      metodo: MetodoPago.TARJETA,
    });

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PAGO_APROBAR',
        entidad: 'Pago',
        entidad_id: 42n,
        valor_nuevo: expect.objectContaining({
          estado: 'aprobado',
          numero_reserva: 'RES-20260101-ABCDE',
        }),
      }),
    );
  });
});

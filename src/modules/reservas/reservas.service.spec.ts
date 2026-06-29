import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReservasService } from './reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ReembolsosService } from '../reembolsos/reembolsos.service';
import { MailService } from '../mail/mail.service';

describe('ReservasService.crear', () => {
  let service: ReservasService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };
  let reembolsos: { calcularMonto: jest.Mock; crearReembolso: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  const idFuncion = '1';
  const idUsuario = '9';
  const idAsiento = '10';

  const asientoFixture = {
    id: 10n,
    id_funcion: 1n,
    id_usuario: 9n,
    estado: 'bloqueado',
    bloqueado_hasta: new Date(Date.now() + 10 * 60_000),
    asientos: {
      codigo: 'A01',
      id_tipo_asiento: 1n,
      tipoAsiento: { nombre: 'General' },
    },
  };

  const reservaFixture = {
    id: 42n,
    numero_reserva: 'RES-20260629-ABCDE',
    estado: 'pendiente_pago',
  };

  beforeEach(async () => {
    const tx = {
      asientosFuncion: {
        findMany: jest.fn().mockResolvedValue([asientoFixture]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      preciosCine: {
        findMany: jest.fn().mockResolvedValue([
          { id_tipo_asiento: 1n, precio: { toString: () => '15.00' } },
        ]),
      },
      reservas: {
        create: jest.fn().mockResolvedValue(reservaFixture),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      reservaAsientos: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma = {
      funciones: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1n,
          salas: { id_cine: 2n },
          peliculas: { fecha_estreno: new Date('2020-01-01') },
        }),
      },
      reservas: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 42n,
          numero_reserva: 'RES-20260629-ABCDE',
          id_usuario: 9n,
          id_funcion: 1n,
          estado: 'pendiente_pago',
          usuarios: { nombre: 'Cliente Test' },
          funciones: {
            fecha_hora: new Date('2026-07-01T20:00:00Z'),
            peliculas: { titulo: 'Película Test' },
            salas: { nombre: 'Sala 1' },
          },
          reservaAsientos: [
            { asientosfuncion: { asientos: { fila: 'A', columna: 1 } } },
          ],
          pagos: [],
        }),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(tx)),
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    reembolsos = { calcularMonto: jest.fn(), crearReembolso: jest.fn() };
    eventEmitter = { emit: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: ReembolsosService, useValue: reembolsos },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: MailService, useValue: { sendConfirmacionEmail: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(ReservasService);
  });

  it('setea expira_en a ~30 minutos en el futuro', async () => {
    const before = Date.now();
    const result = await service.crear(idFuncion, [idAsiento], idUsuario);
    const after = Date.now();

    const expira = new Date(result.expira_en).getTime();
    const esperadoMin = before + 29 * 60_000;
    const esperadoMax = after + 31 * 60_000;

    expect(expira).toBeGreaterThanOrEqual(esperadoMin);
    expect(expira).toBeLessThanOrEqual(esperadoMax);
  });
});

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
        { provide: MailService, useValue: { sendConfirmacionEmail: jest.fn() } },
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

describe('ReservasService.reenviarBoletoUsuario', () => {
  let service: ReservasService;
  let prisma: any;
  let mail: { sendConfirmacionEmail: jest.Mock };
  let reembolsos: { calcularMonto: jest.Mock; crearReembolso: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      reservas: {
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    mail = { sendConfirmacionEmail: jest.fn().mockResolvedValue(undefined) };
    reembolsos = { calcularMonto: jest.fn(), crearReembolso: jest.fn() };
    eventEmitter = { emit: jest.fn() };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: prisma },
        { provide: ReembolsosService, useValue: reembolsos },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MailService, useValue: mail },
      ],
    }).compile();
    service = moduleRef.get(ReservasService);
  });

  it('envía email y actualiza ultimo_reenvio_at cuando hay cooldown vencido', async () => {
    const reservaRow = {
      id: 1n, numero_reserva: 'RES-1', estado: 'pagada', id_usuario: 7n,
      ultimo_reenvio_at: new Date(Date.now() - 120_000),
    };
    prisma.reservas.findFirst.mockResolvedValue(reservaRow);
    prisma.reservas.findUniqueOrThrow.mockResolvedValue({
      ...reservaRow,
      usuarios: { nombre: 'Test', email: 'test@example.com' },
      funciones: {
        fecha_hora: new Date('2026-07-01T20:00:00Z'),
        peliculas: { titulo: 'Pelicula Test' },
        salas: { nombre: 'Sala 1', cines: { nombre: 'Cine Test' } },
      },
      reservaAsientos: [
        {
          asientosfuncion: {
            asientos: { codigo: 'A01', tipoAsiento: { nombre: 'General' } },
          },
        },
      ],
      pagos: [],
    });

    const out = await service.reenviarBoletoUsuario('RES-1', 7n);
    expect(out).toEqual({ ok: true });
    expect(prisma.reservas.update).toHaveBeenCalled();
    expect(mail.sendConfirmacionEmail).toHaveBeenCalled();
  });

  it('retorna 429 con retry_after cuando cooldown activo', async () => {
    const recent = new Date(Date.now() - 10_000);
    prisma.reservas.findFirst.mockResolvedValue({
      id: 1n, numero_reserva: 'RES-1', estado: 'pagada', id_usuario: 7n,
      ultimo_reenvio_at: recent,
    });

    const out = await service.reenviarBoletoUsuario('RES-1', 7n);
    expect(out.ok).toBe(false);
    expect((out as any).retry_after).toBeGreaterThan(40);
    expect((out as any).retry_after).toBeLessThanOrEqual(60);
    expect(mail.sendConfirmacionEmail).not.toHaveBeenCalled();
  });
});

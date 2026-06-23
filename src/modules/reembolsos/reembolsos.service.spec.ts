import { Test } from '@nestjs/testing';
import { ReembolsosService } from './reembolsos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('ReembolsosService.calcularMonto', () => {
  let service: ReembolsosService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      reservas: { findUnique: jest.fn() },
      politicaCancelacion: { findFirst: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReembolsosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: { registrar: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(ReembolsosService);
  });

  it('retorna 0 cuando no hay pago aprobado', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      funciones: {
        fecha_hora: new Date(Date.now() + 48 * 3600000),
        salas: { id_cine: 1n },
      },
      pagos: [],
    });
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({
      pagoId: null,
      monto: 0,
      porcentaje: 0,
      politicaId: null,
    });
  });

  it('retorna 0 cuando no hay política activa para el cine', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      funciones: {
        fecha_hora: new Date(Date.now() + 48 * 3600000),
        salas: { id_cine: 1n },
      },
      pagos: [{ id: 10n, monto_final: { toString: () => '100' } }],
    });
    prisma.politicaCancelacion.findFirst.mockResolvedValueOnce(null);
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({
      pagoId: 10n,
      monto: 0,
      porcentaje: 0,
      politicaId: null,
    });
  });

  it('calcula porcentaje según la regla activa', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      funciones: {
        fecha_hora: new Date(Date.now() + 48 * 3600000),
        salas: { id_cine: 1n },
      },
      pagos: [{ id: 10n, monto_final: { toString: () => '200' } }],
    });
    prisma.politicaCancelacion.findFirst.mockResolvedValueOnce({
      id: 7n,
      reglas: [{ porcentaje_reembolso: { toString: () => '50' } }],
    });
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({
      pagoId: 10n,
      monto: 100,
      porcentaje: 50,
      politicaId: 7n,
    });
  });
});

describe('ReembolsosService.procesarEfectivo', () => {
  let service: ReembolsosService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      reembolsos: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReembolsosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(ReembolsosService);
  });

  it('registra audit REEMBOLSO_PROCESAR con snapshot pendiente → procesado', async () => {
    const prev = {
      id: 7n,
      id_pago: 3n,
      id_politica: 1n,
      porcentaje_aplicado: '50.00',
      monto: '100.00',
      estado: 'pendiente',
      fecha_procesado: null,
    };
    const after = {
      ...prev,
      estado: 'procesado',
      fecha_procesado: new Date('2026-01-01T00:00:00.000Z'),
    };
    prisma.reembolsos.findUnique.mockResolvedValueOnce(prev);
    prisma.reembolsos.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.reembolsos.findUniqueOrThrow.mockResolvedValueOnce(after);

    await service.procesarEfectivo('7', 9n);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'REEMBOLSO_PROCESAR',
        entidad: 'Reembolso',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ estado: 'pendiente' }),
        valor_nuevo: expect.objectContaining({ estado: 'procesado' }),
      }),
    );
  });
});

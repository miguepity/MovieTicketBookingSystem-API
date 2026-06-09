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
      funciones: { fecha_hora: new Date(Date.now() + 48 * 3600000), salas: { id_cine: 1n } },
      pagos: [],
    });
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({ pagoId: null, monto: 0, porcentaje: 0, politicaId: null });
  });

  it('retorna 0 cuando no hay política activa para el cine', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      funciones: { fecha_hora: new Date(Date.now() + 48 * 3600000), salas: { id_cine: 1n } },
      pagos: [{ id: 10n, monto_final: { toString: () => '100' } }],
    });
    prisma.politicaCancelacion.findFirst.mockResolvedValueOnce(null);
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({ pagoId: 10n, monto: 0, porcentaje: 0, politicaId: null });
  });

  it('calcula porcentaje según la regla activa', async () => {
    prisma.reservas.findUnique.mockResolvedValueOnce({
      funciones: { fecha_hora: new Date(Date.now() + 48 * 3600000), salas: { id_cine: 1n } },
      pagos: [{ id: 10n, monto_final: { toString: () => '200' } }],
    });
    prisma.politicaCancelacion.findFirst.mockResolvedValueOnce({
      id: 7n,
      reglas: [{ porcentaje_reembolso: { toString: () => '50' } }],
    });
    const res = await service.calcularMonto(1n);
    expect(res).toEqual({ pagoId: 10n, monto: 100, porcentaje: 50, politicaId: 7n });
  });
});

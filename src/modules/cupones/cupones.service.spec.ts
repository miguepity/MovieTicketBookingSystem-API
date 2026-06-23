import { Test } from '@nestjs/testing';
import { CuponesService } from './cupones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const cuponBase = (overrides: any = {}) => ({
  id: 7n,
  codigo: 'PROMO10',
  tipo: 'porcentaje',
  valor: { toString: () => '10' },
  fecha_expiracion: new Date('2030-12-31T00:00:00Z'),
  usos_maximos: 100,
  activo: true,
  ...overrides,
});

describe('CuponesService (audit-log instrumentation)', () => {
  let service: CuponesService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      cupones: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CuponesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(CuponesService);
  });

  it('create: registra CUPON_CREAR', async () => {
    prisma.cupones.create.mockResolvedValueOnce(cuponBase());
    await service.create(
      {
        codigo: 'PROMO10',
        tipo: 'porcentaje',
        valor: 10,
        fecha_expiracion: '2030-12-31',
        usos_maximos: 100,
      },
      9n,
    );
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUPON_CREAR',
        entidad: 'Cupon',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({ codigo: 'PROMO10' }),
      }),
    );
  });

  it('update: registra CUPON_EDITAR', async () => {
    prisma.cupones.findUnique.mockResolvedValueOnce(cuponBase());
    prisma.cupones.update.mockResolvedValueOnce(
      cuponBase({ codigo: 'PROMO20' }),
    );
    await service.update('7', { codigo: 'PROMO20' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUPON_EDITAR',
        entidad: 'Cupon',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ codigo: 'PROMO10' }),
        valor_nuevo: expect.objectContaining({ codigo: 'PROMO20' }),
      }),
    );
  });

  it('toggleStatus: registra CUPON_TOGGLE', async () => {
    prisma.cupones.findUnique.mockResolvedValueOnce(
      cuponBase({ activo: true }),
    );
    prisma.cupones.update.mockResolvedValueOnce(cuponBase({ activo: false }));
    await service.toggleStatus('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUPON_TOGGLE',
        entidad: 'Cupon',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ activo: true }),
        valor_nuevo: expect.objectContaining({ activo: false }),
      }),
    );
  });

  it('remove: registra CUPON_ELIMINAR', async () => {
    prisma.cupones.findUnique.mockResolvedValueOnce(cuponBase({ pagos: [] }));
    prisma.cupones.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUPON_ELIMINAR',
        entidad: 'Cupon',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ codigo: 'PROMO10' }),
      }),
    );
  });
});

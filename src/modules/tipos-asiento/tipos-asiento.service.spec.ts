import { Test } from '@nestjs/testing';
import { TiposAsientoService } from './tipos-asiento.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('TiposAsientoService (audit-log instrumentation)', () => {
  let service: TiposAsientoService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      tiposAsiento: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      asientos: { count: jest.fn().mockResolvedValue(0) },
      preciosCine: { count: jest.fn().mockResolvedValue(0) },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TiposAsientoService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(TiposAsientoService);
  });

  it('create: registra TIPO_ASIENTO_CREAR', async () => {
    prisma.tiposAsiento.findUnique.mockResolvedValueOnce(null);
    prisma.tiposAsiento.create.mockResolvedValueOnce({ id: 7n, nombre: 'VIP' });
    await service.create({ nombre: 'VIP' } as any, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'TIPO_ASIENTO_CREAR',
        entidad: 'TipoAsiento',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({ nombre: 'VIP' }),
      }),
    );
  });

  it('update: registra TIPO_ASIENTO_EDITAR', async () => {
    prisma.tiposAsiento.findUnique
      .mockResolvedValueOnce({ id: 7n, nombre: 'Old' })
      .mockResolvedValueOnce(null);
    prisma.tiposAsiento.update.mockResolvedValueOnce({ id: 7n, nombre: 'New' });
    await service.update('7', { nombre: 'New' } as any, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'TIPO_ASIENTO_EDITAR',
        entidad: 'TipoAsiento',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });

  it('remove: registra TIPO_ASIENTO_ELIMINAR', async () => {
    prisma.tiposAsiento.findUnique.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Old',
    });
    prisma.tiposAsiento.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'TIPO_ASIENTO_ELIMINAR',
        entidad: 'TipoAsiento',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
      }),
    );
  });
});

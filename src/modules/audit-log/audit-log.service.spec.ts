import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findMany?: jest.Mock;
      count?: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = { auditLog: { create: jest.fn().mockResolvedValue({}) } };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it('crea un registro de auditoría con los campos requeridos', async () => {
    await service.registrar({
      id_usuario: 1n,
      id_auditor: 2n,
      accion: 'LOGIN',
      detalle: 'login ok',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        id_usuario: 1n,
        id_auditor: 2n,
        accion: 'LOGIN',
        detalle: 'login ok',
        entidad: undefined,
        entidad_id: undefined,
        valor_anterior: undefined,
        valor_nuevo: undefined,
      },
    });
  });

  it('si la inserción falla, no propaga el error', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    prisma.auditLog.create.mockRejectedValueOnce(new Error('db down'));
    await expect(
      service.registrar({ id_usuario: 1n, id_auditor: 1n, accion: 'LOGIN' }),
    ).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

describe('AuditLogService.registrar', () => {
  let service: AuditLogService;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = { auditLog: { create: jest.fn().mockResolvedValue(undefined) } };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it('persiste entidad, entidad_id, valor_anterior y valor_nuevo cuando se pasan', async () => {
    await service.registrar({
      id_usuario: 1n,
      id_auditor: 2n,
      accion: 'PELICULA_EDITAR',
      detalle: 'Película 7 editada',
      entidad: 'Pelicula',
      entidad_id: 7n,
      valor_anterior: { titulo: 'A' },
      valor_nuevo: { titulo: 'B' },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        id_usuario: 1n,
        id_auditor: 2n,
        accion: 'PELICULA_EDITAR',
        detalle: 'Película 7 editada',
        entidad: 'Pelicula',
        entidad_id: 7n,
        valor_anterior: { titulo: 'A' },
        valor_nuevo: { titulo: 'B' },
      },
    });
  });

  it('omite campos opcionales cuando no se pasan (LOGIN/LOGOUT)', async () => {
    await service.registrar({
      id_usuario: 1n,
      id_auditor: 1n,
      accion: 'LOGIN',
      detalle: 'Login: x@y.com',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        id_usuario: 1n,
        id_auditor: 1n,
        accion: 'LOGIN',
        detalle: 'Login: x@y.com',
        entidad: undefined,
        entidad_id: undefined,
        valor_anterior: undefined,
        valor_nuevo: undefined,
      },
    });
  });
});

describe('AuditLogService.list', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  const baseRow = {
    id: 10n,
    created_at: new Date('2026-01-15T12:00:00Z'),
    accion: 'PELICULA_EDITAR',
    detalle: 'edit',
    entidad: 'Pelicula',
    entidad_id: 7n,
    valor_anterior: null as unknown,
    valor_nuevo: null as unknown,
    realizado_por: { id: 2n, nombre: 'Admin', email: 'a@x.com' },
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([baseRow]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it('filtra por accion única (envuelta en array via DTO)', async () => {
    await service.list({ accion: ['PELICULA_EDITAR'] });
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { accion: { in: ['PELICULA_EDITAR'] } },
      }),
    );
  });

  it('filtra por múltiples acciones', async () => {
    await service.list({ accion: ['LOGIN', 'LOGOUT', 'PELICULA_EDITAR'] });
    const call = prisma.auditLog.findMany.mock.calls[0][0];
    expect(call.where.accion).toEqual({
      in: ['LOGIN', 'LOGOUT', 'PELICULA_EDITAR'],
    });
  });

  it('filtra por entidad', async () => {
    await service.list({ entidad: 'Pelicula' });
    const call = prisma.auditLog.findMany.mock.calls[0][0];
    expect(call.where.entidad).toBe('Pelicula');
  });

  it('filtra por rango de fechas (desde y hasta) ajustando hasta a fin de día UTC', async () => {
    await service.list({
      fecha_desde: '2026-01-01',
      fecha_hasta: '2026-01-31',
    });
    const call = prisma.auditLog.findMany.mock.calls[0][0];
    expect(call.where.created_at.gte).toEqual(new Date('2026-01-01'));
    const fin = call.where.created_at.lte as Date;
    expect(fin.getUTCHours()).toBe(23);
    expect(fin.getUTCMinutes()).toBe(59);
    expect(fin.getUTCSeconds()).toBe(59);
    expect(fin.getUTCMilliseconds()).toBe(999);
  });

  it('calcula skip y take a partir de page/page_size', async () => {
    await service.list({ page: 3, page_size: 25 });
    const call = prisma.auditLog.findMany.mock.calls[0][0];
    expect(call.take).toBe(25);
    expect(call.skip).toBe(50);
  });

  it('usa defaults page=1, page_size=20 cuando no se pasan', async () => {
    await service.list({});
    const call = prisma.auditLog.findMany.mock.calls[0][0];
    expect(call.take).toBe(20);
    expect(call.skip).toBe(0);
  });

  it('mapea tiene_snapshot=true cuando hay valor_anterior', async () => {
    prisma.auditLog.findMany.mockResolvedValueOnce([
      { ...baseRow, valor_anterior: { x: 1 }, valor_nuevo: null },
    ]);
    const res = await service.list({});
    expect(res.items[0].tiene_snapshot).toBe(true);
  });

  it('mapea tiene_snapshot=true cuando hay valor_nuevo', async () => {
    prisma.auditLog.findMany.mockResolvedValueOnce([
      { ...baseRow, valor_anterior: null, valor_nuevo: { x: 2 } },
    ]);
    const res = await service.list({});
    expect(res.items[0].tiene_snapshot).toBe(true);
  });

  it('mapea tiene_snapshot=false cuando ambos snapshots son null', async () => {
    const res = await service.list({});
    expect(res.items[0].tiene_snapshot).toBe(false);
  });

  it('serializa BigInts a string y created_at a ISO string', async () => {
    const res = await service.list({});
    expect(res.items[0].id).toBe('10');
    expect(res.items[0].entidad_id).toBe('7');
    expect(res.items[0].auditor.id).toBe('2');
    expect(res.items[0].created_at).toBe('2026-01-15T12:00:00.000Z');
    expect(res.total).toBe(1);
    expect(res.page).toBe(1);
    expect(res.page_size).toBe(20);
  });
});

describe('AuditLogService.getById', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it('devuelve detalle con snapshots completos', async () => {
    prisma.auditLog.findUnique = jest.fn().mockResolvedValue({
      id: 1n,
      created_at: new Date('2026-06-15T10:00:00Z'),
      accion: 'PELICULA_EDITAR',
      detalle: 'x',
      entidad: 'Pelicula',
      entidad_id: 7n,
      valor_anterior: { titulo: 'A' },
      valor_nuevo: { titulo: 'B' },
      realizado_por: { id: 2n, nombre: 'X', email: 'x@x.com' },
    });

    const res = await service.getById('1');
    expect(res.id).toBe('1');
    expect(res.entidad_id).toBe('7');
    expect(res.valor_anterior).toEqual({ titulo: 'A' });
    expect(res.valor_nuevo).toEqual({ titulo: 'B' });
  });

  it('lanza NotFoundException si no existe', async () => {
    prisma.auditLog.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.getById('999')).rejects.toThrow();
  });
});

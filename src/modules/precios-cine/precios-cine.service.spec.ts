import { Test } from '@nestjs/testing';
import { PreciosCineService } from './precios-cine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const decimal = (s: string) => ({ toFixed: () => s, toString: () => s });

describe('PreciosCineService (audit-log instrumentation)', () => {
  let service: PreciosCineService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      cines: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
      tiposAsiento: { findUnique: jest.fn().mockResolvedValue({ id: 2n }) },
      preciosCine: {
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
        PreciosCineService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(PreciosCineService);
  });

  it('create: registra PRECIO_CREAR', async () => {
    prisma.preciosCine.findUnique.mockResolvedValueOnce(null);
    prisma.preciosCine.create.mockResolvedValueOnce({
      id: 7n,
      precio: decimal('25.00'),
      cine: { id: 1n, nombre: 'CineStar' },
      tipo_asiento: { id: 2n, nombre: 'VIP' },
    });
    await service.create(
      { id_cine: '1', id_tipo_asiento: '2', precio: '25.00' },
      9n,
    );
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PRECIO_CREAR',
        entidad: 'PrecioCine',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({
          cine_nombre: 'CineStar',
          tipo_asiento_nombre: 'VIP',
          precio: '25.00',
        }),
      }),
    );
  });

  it('update: registra PRECIO_EDITAR', async () => {
    prisma.preciosCine.findUnique.mockResolvedValueOnce({
      id: 7n,
      precio: decimal('20.00'),
      cine: { id: 1n, nombre: 'CineStar' },
      tipo_asiento: { id: 2n, nombre: 'VIP' },
    });
    prisma.preciosCine.update.mockResolvedValueOnce({
      id: 7n,
      precio: decimal('25.00'),
      cine: { id: 1n, nombre: 'CineStar' },
      tipo_asiento: { id: 2n, nombre: 'VIP' },
    });
    await service.update('7', { precio: '25.00' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PRECIO_EDITAR',
        entidad: 'PrecioCine',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ precio: '20.00' }),
        valor_nuevo: expect.objectContaining({ precio: '25.00' }),
      }),
    );
  });

  it('remove: registra PRECIO_ELIMINAR', async () => {
    prisma.preciosCine.findUnique.mockResolvedValueOnce({
      id: 7n,
      precio: decimal('20.00'),
      cine: { id: 1n, nombre: 'CineStar' },
      tipo_asiento: { id: 2n, nombre: 'VIP' },
    });
    prisma.preciosCine.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PRECIO_ELIMINAR',
        entidad: 'PrecioCine',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ precio: '20.00' }),
      }),
    );
  });
});

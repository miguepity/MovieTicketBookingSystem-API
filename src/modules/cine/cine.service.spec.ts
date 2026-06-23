import { Test } from '@nestjs/testing';
import { CineService } from './cine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('CineService (audit-log instrumentation)', () => {
  let service: CineService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ciudades: {
        findUnique: jest.fn().mockResolvedValue({ id: 1n }),
      },
      cines: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CineService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(CineService);
  });

  it('create: registra CINE_CREAR', async () => {
    prisma.cines.create.mockResolvedValueOnce({
      id: 7n,
      nombre: 'CineStar',
      direccion: 'Av 1',
      id_ciudad: 1n,
      ciudades: { nombre: 'Lima' },
    });
    await service.create(
      { nombre: 'CineStar', direccion: 'Av 1', id_ciudad: '1' },
      9n,
    );
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CINE_CREAR',
        entidad: 'Cine',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({
          nombre: 'CineStar',
          ciudad_nombre: 'Lima',
        }),
      }),
    );
  });

  it('update: registra CINE_EDITAR', async () => {
    prisma.cines.findUnique.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Old',
      direccion: null,
      id_ciudad: 1n,
      ciudades: { nombre: 'Lima' },
    });
    prisma.cines.update.mockResolvedValueOnce({
      id: 7n,
      nombre: 'New',
      direccion: 'Av 2',
      id_ciudad: 1n,
      ciudades: { nombre: 'Lima' },
    });
    await service.update('7', { nombre: 'New', direccion: 'Av 2' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CINE_EDITAR',
        entidad: 'Cine',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });

  it('remove: registra CINE_ELIMINAR', async () => {
    prisma.cines.findUnique.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Old',
      direccion: null,
      id_ciudad: 1n,
      ciudades: { nombre: 'Lima' },
    });
    prisma.cines.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CINE_ELIMINAR',
        entidad: 'Cine',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
      }),
    );
  });
});

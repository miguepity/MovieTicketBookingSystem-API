import { Test } from '@nestjs/testing';
import { GenerosService } from './generos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('GenerosService (audit-log instrumentation)', () => {
  let service: GenerosService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      generos: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      peliculas: { count: jest.fn().mockResolvedValue(0) },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GenerosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(GenerosService);
  });

  it('create: registra GENERO_CREAR', async () => {
    prisma.generos.findUnique.mockResolvedValueOnce(null);
    prisma.generos.create.mockResolvedValueOnce({ id: 7n, nombre: 'Acción' });
    await service.create({ nombre: 'Acción' } as any, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'GENERO_CREAR',
        entidad: 'Genero',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({ nombre: 'Acción' }),
      }),
    );
  });

  it('update: registra GENERO_EDITAR con valor_anterior y valor_nuevo', async () => {
    prisma.generos.findUnique
      .mockResolvedValueOnce({ id: 7n, nombre: 'Old' })
      .mockResolvedValueOnce(null);
    prisma.generos.update.mockResolvedValueOnce({ id: 7n, nombre: 'New' });
    await service.update('7', { nombre: 'New' } as any, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'GENERO_EDITAR',
        entidad: 'Genero',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });

  it('remove: registra GENERO_ELIMINAR con valor_anterior', async () => {
    prisma.generos.findUnique.mockResolvedValueOnce({ id: 7n, nombre: 'Old' });
    prisma.generos.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'GENERO_ELIMINAR',
        entidad: 'Genero',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
      }),
    );
  });
});

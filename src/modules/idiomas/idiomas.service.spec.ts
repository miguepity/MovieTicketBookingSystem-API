import { Test } from '@nestjs/testing';
import { IdiomasService } from './idiomas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('IdiomasService (audit-log instrumentation)', () => {
  let service: IdiomasService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      idiomas: {
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
        IdiomasService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(IdiomasService);
  });

  it('create: registra IDIOMA_CREAR', async () => {
    prisma.idiomas.findUnique.mockResolvedValueOnce(null);
    prisma.idiomas.create.mockResolvedValueOnce({ id: 7n, nombre: 'Español' });
    await service.create({ nombre: 'Español' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'IDIOMA_CREAR',
        entidad: 'Idioma',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({ nombre: 'Español' }),
      }),
    );
  });

  it('update: registra IDIOMA_EDITAR', async () => {
    prisma.idiomas.findUnique
      .mockResolvedValueOnce({ id: 7n, nombre: 'Old' })
      .mockResolvedValueOnce(null);
    prisma.idiomas.update.mockResolvedValueOnce({ id: 7n, nombre: 'New' });
    await service.update('7', { nombre: 'New' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'IDIOMA_EDITAR',
        entidad: 'Idioma',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });

  it('remove: registra IDIOMA_ELIMINAR', async () => {
    prisma.idiomas.findUnique.mockResolvedValueOnce({ id: 7n, nombre: 'Old' });
    prisma.idiomas.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'IDIOMA_ELIMINAR',
        entidad: 'Idioma',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
      }),
    );
  });
});

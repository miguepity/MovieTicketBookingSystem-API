import { Test } from '@nestjs/testing';
import { CiudadesService } from './ciudades.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('CiudadesService (audit-log instrumentation)', () => {
  let service: CiudadesService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ciudades: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CiudadesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(CiudadesService);
  });

  it('create: registra CIUDAD_CREAR', async () => {
    prisma.ciudades.create.mockResolvedValueOnce({ id: 7n, nombre: 'Lima' });
    await service.create({ nombre: 'Lima' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CIUDAD_CREAR',
        entidad: 'Ciudad',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({ nombre: 'Lima' }),
      }),
    );
  });

  it('update: registra CIUDAD_EDITAR', async () => {
    prisma.ciudades.findUnique.mockResolvedValueOnce({ id: 7n, nombre: 'Old' });
    prisma.ciudades.update.mockResolvedValueOnce({ id: 7n, nombre: 'New' });
    await service.update('7', { nombre: 'New' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CIUDAD_EDITAR',
        entidad: 'Ciudad',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });
});

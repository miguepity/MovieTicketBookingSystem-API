import { Test } from '@nestjs/testing';
import { SalasService } from './salas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('SalasService (audit-log instrumentation)', () => {
  let service: SalasService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (cb: (tx: any) => Promise<any>) =>
        cb(prisma),
      ),
      salas: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      tiposAsiento: {
        findFirst: jest.fn().mockResolvedValue({ id: 1n }),
      },
      asientos: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      funciones: { count: jest.fn().mockResolvedValue(0) },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SalasService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(SalasService);
  });

  it('create: registra SALA_CREAR', async () => {
    prisma.salas.create.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Sala 1',
      id_cine: 1n,
      filas: 10,
      columnas: 12,
      cines: { nombre: 'CineStar' },
    });
    await service.create(
      { nombre: 'Sala 1', id_cine: '1', filas: 10, columnas: 12 },
      9n,
    );
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'SALA_CREAR',
        entidad: 'Sala',
        entidad_id: 7n,
        valor_nuevo: expect.objectContaining({
          nombre: 'Sala 1',
          cine_nombre: 'CineStar',
          capacidad: 120,
        }),
      }),
    );
  });

  it('update: registra SALA_EDITAR', async () => {
    prisma.salas.findUnique.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Old',
      id_cine: 1n,
      filas: 5,
      columnas: 5,
      cines: { nombre: 'CineStar' },
    });
    prisma.salas.update.mockResolvedValueOnce({
      id: 7n,
      nombre: 'New',
      id_cine: 1n,
      filas: 10,
      columnas: 10,
      cines: { nombre: 'CineStar' },
    });
    await service.update('7', { nombre: 'New' }, 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'SALA_EDITAR',
        entidad: 'Sala',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
        valor_nuevo: expect.objectContaining({ nombre: 'New' }),
      }),
    );
  });

  it('remove: registra SALA_ELIMINAR', async () => {
    prisma.salas.findUnique.mockResolvedValueOnce({
      id: 7n,
      nombre: 'Old',
      id_cine: 1n,
      filas: 5,
      columnas: 5,
      cines: { nombre: 'CineStar' },
    });
    prisma.salas.delete.mockResolvedValueOnce({ id: 7n });
    await service.remove('7', 9n);
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'SALA_ELIMINAR',
        entidad: 'Sala',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({ nombre: 'Old' }),
      }),
    );
  });

  it('genera filas*columnas asientos al crear la sala', async () => {
    prisma.salas.create.mockResolvedValueOnce({
      id: 10n,
      filas: 2,
      columnas: 3,
      id_cine: 1n,
      nombre: 'S',
      cines: { nombre: 'TestCine' },
    });

    await service.create(
      { nombre: 'S', id_cine: '1', filas: 2, columnas: 3 },
      9n,
    );

    expect(prisma.asientos.createMany).toHaveBeenCalled();
    const arg = (prisma.asientos.createMany as jest.Mock).mock.calls[0][0];
    expect(arg.data).toHaveLength(6);
    expect(arg.data[0]).toMatchObject({
      id_sala: 10n,
      fila: 'A',
      columna: 1,
      codigo: 'A1',
    });
    expect(arg.data[5]).toMatchObject({
      id_sala: 10n,
      fila: 'B',
      columna: 3,
      codigo: 'B3',
    });
  });
});

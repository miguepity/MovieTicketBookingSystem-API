import { Test } from '@nestjs/testing';
import { FuncionesService } from './funciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoFuncion } from '../../common/enums/estado-funcion.enum';
import { EstadoAsiento } from '../../common/enums/estado-asiento.enum';

describe('FuncionesService.create', () => {
  let service: FuncionesService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      peliculas: { findUnique: jest.fn() },
      funciones: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1n }),
        update: jest.fn(),
      },
      asientosFuncion: { createMany: jest.fn() },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        FuncionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(FuncionesService);
  });

  it('rechaza si la película no existe', async () => {
    prisma.peliculas.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.create(
        {
          id_pelicula: '99',
          id_sala: '1',
          fecha_hora: '2027-01-01T20:00:00Z',
          estado: EstadoFuncion.PROGRAMADA,
        },
        1n,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('rechaza si la película está desactivada', async () => {
    prisma.peliculas.findUnique.mockResolvedValueOnce({ activo: false });
    await expect(
      service.create(
        {
          id_pelicula: '1',
          id_sala: '1',
          fecha_hora: '2027-01-01T20:00:00Z',
          estado: EstadoFuncion.PROGRAMADA,
        },
        1n,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('registra audit FUNCION_CREAR con snapshot al crear', async () => {
    prisma.peliculas.findUnique.mockResolvedValueOnce({ activo: true });
    prisma.funciones.create.mockResolvedValueOnce({ id: 10n });
    // first findUnique → generarAsientos (with salas.asientos include)
    prisma.funciones.findUnique.mockResolvedValueOnce({
      id: 10n,
      salas: { asientos: [] },
    });
    // second findUnique → audit reload with peliculas/salas
    prisma.funciones.findUnique.mockResolvedValueOnce({
      id: 10n,
      id_pelicula: 1n,
      id_sala: 2n,
      fecha_hora: new Date('2027-01-01T20:00:00Z'),
      estado: EstadoFuncion.PROGRAMADA,
      peliculas: { titulo: 'Pelicula X' },
      salas: { nombre: 'Sala A' },
    });

    await service.create(
      {
        id_pelicula: '1',
        id_sala: '2',
        fecha_hora: '2027-01-01T20:00:00Z',
        estado: EstadoFuncion.PROGRAMADA,
      },
      7n,
    );

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'FUNCION_CREAR',
        entidad: 'Funcion',
        entidad_id: 10n,
        id_auditor: 7n,
        valor_nuevo: expect.objectContaining({
          pelicula_titulo: 'Pelicula X',
          sala_nombre: 'Sala A',
          estado: EstadoFuncion.PROGRAMADA,
        }),
      }),
    );
  });
});

describe('FuncionesService.update / cancelar', () => {
  let service: FuncionesService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      peliculas: { findUnique: jest.fn() },
      funciones: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      asientosFuncion: { createMany: jest.fn() },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        FuncionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(FuncionesService);
  });

  it('registra audit FUNCION_EDITAR con valor_anterior y valor_nuevo', async () => {
    const prev = {
      id: 10n,
      id_pelicula: 1n,
      id_sala: 2n,
      fecha_hora: new Date('2027-01-01T20:00:00Z'),
      estado: EstadoFuncion.PROGRAMADA,
      peliculas: { titulo: 'Pelicula Antes' },
      salas: { nombre: 'Sala A' },
      asientosFuncions: [
        { id_usuario: null, estado: EstadoAsiento.DISPONIBLE },
      ],
    };
    const updated = {
      id: 10n,
      id_pelicula: 1n,
      id_sala: 2n,
      fecha_hora: new Date('2027-02-01T20:00:00Z'),
      estado: EstadoFuncion.PROGRAMADA,
      peliculas: { titulo: 'Pelicula Antes' },
      salas: { nombre: 'Sala A' },
    };
    prisma.funciones.findUnique
      .mockResolvedValueOnce(prev)
      .mockResolvedValueOnce(updated);
    prisma.funciones.update.mockResolvedValueOnce(updated);

    await service.update('10', { fecha_hora: '2027-02-01T20:00:00Z' }, 7n);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'FUNCION_EDITAR',
        entidad: 'Funcion',
        entidad_id: 10n,
        id_auditor: 7n,
        valor_anterior: expect.objectContaining({
          fecha_hora: '2027-01-01T20:00:00.000Z',
        }),
        valor_nuevo: expect.objectContaining({
          fecha_hora: '2027-02-01T20:00:00.000Z',
        }),
      }),
    );
  });

  it('registra audit FUNCION_CANCELAR con valor_anterior', async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const prev = {
      id: 10n,
      id_pelicula: 1n,
      id_sala: 2n,
      fecha_hora: future,
      estado: EstadoFuncion.PROGRAMADA,
      peliculas: { titulo: 'Peli' },
      salas: { nombre: 'Sala' },
    };
    prisma.funciones.findUnique.mockResolvedValueOnce(prev);
    prisma.funciones.update.mockResolvedValueOnce({
      ...prev,
      estado: EstadoFuncion.CANCELADA,
    });

    await service.cancelar('10', 7n);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'FUNCION_CANCELAR',
        entidad: 'Funcion',
        entidad_id: 10n,
        id_auditor: 7n,
        valor_anterior: expect.objectContaining({
          estado: EstadoFuncion.PROGRAMADA,
        }),
      }),
    );
  });
});

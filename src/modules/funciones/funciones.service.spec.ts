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

describe('getMapaAdmin', () => {
  it('devuelve mapa con precio (override por cine), usuario y estado calculado', async () => {
    const now = new Date('2026-06-29T12:00:00Z');
    jest.useFakeTimers().setSystemTime(now);

    const idFuncion = 10n;
    const idCine = 1n;
    const tipoPreferencial = 5n;
    const tipoGeneral = 6n;

    const prismaMock = {
      funciones: {
        findUnique: jest.fn().mockResolvedValue({
          id: idFuncion,
          salas: { filas: 10, columnas: 14, id_cine: idCine },
          asientosFuncions: [
            {
              id: 100n,
              estado: 'disponible',
              bloqueado_hasta: now,
              id_usuario: null,
              usuarios: null,
              asientos: {
                fila: 'A',
                columna: 1,
                codigo: 'A-01',
                id_tipo_asiento: tipoPreferencial,
                tipoAsiento: { id: tipoPreferencial, nombre: 'preferencial', color: '#F59E0B' },
              },
            },
            {
              id: 101n,
              estado: 'bloqueado',
              bloqueado_hasta: new Date('2026-06-29T11:00:00Z'), // expirado
              id_usuario: 7n,
              usuarios: { id: 7n, email: 'cliente@cinema.com' },
              asientos: {
                fila: 'A',
                columna: 2,
                codigo: 'A-02',
                id_tipo_asiento: tipoGeneral,
                tipoAsiento: { id: tipoGeneral, nombre: 'general', color: '#3B82F6' },
              },
            },
            {
              id: 102n,
              estado: 'reservado',
              bloqueado_hasta: new Date('2026-06-29T13:00:00Z'),
              id_usuario: 7n,
              usuarios: { id: 7n, email: 'cliente@cinema.com' },
              asientos: {
                fila: 'A',
                columna: 3,
                codigo: 'A-03',
                id_tipo_asiento: tipoPreferencial,
                tipoAsiento: { id: tipoPreferencial, nombre: 'preferencial', color: '#F59E0B' },
              },
            },
          ],
        }),
      },
      preciosCine: {
        findMany: jest.fn().mockResolvedValue([
          { id_cine: idCine, id_tipo_asiento: tipoPreferencial, precio: 100 },
          { id_cine: null, id_tipo_asiento: tipoGeneral, precio: 50 },
        ]),
      },
    };

    const svc = new FuncionesService(prismaMock as any, {} as any, {} as any);
    const result = await svc.getMapaAdmin(idFuncion);

    expect(prismaMock.preciosCine.findMany).toHaveBeenCalledWith({
      where: {
        id_tipo_asiento: { in: expect.arrayContaining([tipoPreferencial, tipoGeneral]) },
        OR: [{ id_cine: idCine }, { id_cine: null }],
      },
    });

    expect(result.funcion_id).toBe('10');
    expect(result.sala).toEqual({ filas: 10, columnas: 14 });
    expect(result.asientos).toHaveLength(3);

    // Asiento 100: disponible, sin usuario, sin bloqueado_hasta, precio preferencial=100
    expect(result.asientos[0]).toEqual({
      id_asiento_funcion: '100',
      fila: 'A',
      columna: 1,
      codigo: 'A-01',
      tipo: 'preferencial',
      color: '#F59E0B',
      estado: 'disponible',
      precio: 100,
      usuario: null,
      bloqueado_hasta: null,
    });

    // Asiento 101: bloqueado pero expirado → estado disponible, usuario y bloqueado_hasta nulos
    expect(result.asientos[1]).toEqual({
      id_asiento_funcion: '101',
      fila: 'A',
      columna: 2,
      codigo: 'A-02',
      tipo: 'general',
      color: '#3B82F6',
      estado: 'disponible',
      precio: 50,
      usuario: null,
      bloqueado_hasta: null,
    });

    // Asiento 102: reservado (no se altera por la regla de expiración)
    expect(result.asientos[2]).toEqual({
      id_asiento_funcion: '102',
      fila: 'A',
      columna: 3,
      codigo: 'A-03',
      tipo: 'preferencial',
      color: '#F59E0B',
      estado: 'reservado',
      precio: 100,
      usuario: { id: '7', email: 'cliente@cinema.com' },
      bloqueado_hasta: '2026-06-29T13:00:00.000Z',
    });

    jest.useRealTimers();
  });

  it('lanza NotFoundException FUNCION_NO_ENCONTRADA si no existe', async () => {
    const prismaMock = {
      funciones: { findUnique: jest.fn().mockResolvedValue(null) },
      preciosCine: { findMany: jest.fn() },
    };
    const svc = new FuncionesService(prismaMock as any, {} as any, {} as any);

    await expect(svc.getMapaAdmin(999n)).rejects.toMatchObject({
      response: { code: 'FUNCION_NO_ENCONTRADA' },
    });
    expect(prismaMock.preciosCine.findMany).not.toHaveBeenCalled();
  });

  it('lanza ConflictException PRECIO_NO_CONFIGURADO si falta precio para algún tipo', async () => {
    const prismaMock = {
      funciones: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10n,
          salas: { filas: 1, columnas: 1, id_cine: 1n },
          asientosFuncions: [
            {
              id: 100n,
              estado: 'disponible',
              bloqueado_hasta: new Date(),
              id_usuario: null,
              usuarios: null,
              asientos: {
                fila: 'A',
                columna: 1,
                codigo: 'A-01',
                id_tipo_asiento: 5n,
                tipoAsiento: { id: 5n, nombre: 'preferencial', color: null },
              },
            },
          ],
        }),
      },
      preciosCine: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const svc = new FuncionesService(prismaMock as any, {} as any, {} as any);

    await expect(svc.getMapaAdmin(10n)).rejects.toMatchObject({
      response: { code: 'PRECIO_NO_CONFIGURADO' },
    });
  });

  it('prefiere precio override por cine sobre default global', async () => {
    const idCine = 1n;
    const tipo = 5n;
    const prismaMock = {
      funciones: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10n,
          salas: { filas: 1, columnas: 1, id_cine: idCine },
          asientosFuncions: [
            {
              id: 100n,
              estado: 'disponible',
              bloqueado_hasta: new Date(),
              id_usuario: null,
              usuarios: null,
              asientos: {
                fila: 'A',
                columna: 1,
                codigo: 'A-01',
                id_tipo_asiento: tipo,
                tipoAsiento: { id: tipo, nombre: 'preferencial', color: null },
              },
            },
          ],
        }),
      },
      preciosCine: {
        findMany: jest.fn().mockResolvedValue([
          { id_cine: null, id_tipo_asiento: tipo, precio: 50 },     // global
          { id_cine: idCine, id_tipo_asiento: tipo, precio: 120 },  // override cine
        ]),
      },
    };
    const svc = new FuncionesService(prismaMock as any, {} as any, {} as any);
    const result = await svc.getMapaAdmin(10n);
    expect(result.asientos[0].precio).toBe(120);
  });
});

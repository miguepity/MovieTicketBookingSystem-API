import { Test } from '@nestjs/testing';
import { FuncionesService } from './funciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoFuncion } from '../../common/enums/estado-funcion.enum';

describe('FuncionesService.create', () => {
  let service: FuncionesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      peliculas: { findUnique: jest.fn() },
      funciones: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1n }),
      },
      asientosFuncion: { createMany: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        FuncionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: AuditLogService, useValue: { registrar: jest.fn() } },
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
});

import { CalificacionesService } from './calificaciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const buildAuditLog = (): AuditLogService =>
  ({
    registrar: jest.fn().mockResolvedValue(undefined),
  }) as unknown as AuditLogService;

describe('CalificacionesService.obtenerMia', () => {
  let service: CalificacionesService;
  let prisma: {
    reservas: { findFirst: jest.Mock };
    calificacionPelicula: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      reservas: { findFirst: jest.fn() },
      calificacionPelicula: { findUnique: jest.fn() },
    };
    service = new CalificacionesService(
      prisma as unknown as PrismaService,
      buildAuditLog(),
    );
  });

  it('retorna elegible=true y puntuacion existente cuando hay reserva pagada con función pasada', async () => {
    prisma.reservas.findFirst.mockResolvedValueOnce({ id: 1n } as any);
    prisma.calificacionPelicula.findUnique.mockResolvedValueOnce({ puntuacion: 4 } as any);

    const result = await service.obtenerMia(10n, 20n);

    expect(result).toEqual({ elegible: true, puntuacion: 4 });
  });

  it('retorna elegible=true y puntuacion=null cuando asistió pero no calificó', async () => {
    prisma.reservas.findFirst.mockResolvedValueOnce({ id: 1n } as any);
    prisma.calificacionPelicula.findUnique.mockResolvedValueOnce(null);

    const result = await service.obtenerMia(10n, 20n);

    expect(result).toEqual({ elegible: true, puntuacion: null });
  });

  it('retorna elegible=false cuando no asistió a ninguna función pasada y pagada', async () => {
    prisma.reservas.findFirst.mockResolvedValueOnce(null);
    prisma.calificacionPelicula.findUnique.mockResolvedValueOnce(null);

    const result = await service.obtenerMia(10n, 20n);

    expect(result).toEqual({ elegible: false, puntuacion: null });
  });
});

describe('CalificacionesService.calificar', () => {
  let service: CalificacionesService;
  let prisma: {
    reservas: { findFirst: jest.Mock };
    calificacionPelicula: { findUnique: jest.Mock; upsert: jest.Mock };
    peliculas: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      reservas: { findFirst: jest.fn() },
      calificacionPelicula: { findUnique: jest.fn(), upsert: jest.fn() },
      peliculas: { findUnique: jest.fn() },
    };
    service = new CalificacionesService(
      prisma as unknown as PrismaService,
      buildAuditLog(),
    );
  });

  it('lanza 403 si el usuario no asistió a una función pasada', async () => {
    prisma.reservas = { findFirst: jest.fn().mockResolvedValue(null) };
    await expect(service.calificar(1n, 2n, 4)).rejects.toThrow('Forbidden');
  });

  it('hace upsert y devuelve rating actualizado', async () => {
    prisma.reservas = {
      findFirst: jest.fn().mockResolvedValue({ id: 99n }),
    };
    prisma.calificacionPelicula.findUnique = jest
      .fn()
      .mockResolvedValue(null);
    prisma.calificacionPelicula.upsert = jest
      .fn()
      .mockResolvedValue({ puntuacion: 4 });
    prisma.peliculas = {
      findUnique: jest
        .fn()
        .mockResolvedValue({ rating_promedio: 4.3, rating_count: 10 }),
    };
    const r = await service.calificar(1n, 2n, 4);
    expect(r).toEqual({
      puntuacion: 4,
      rating_promedio: 4.3,
      rating_count: 10,
    });
  });
});

describe('CalificacionesService.borrar', () => {
  let service: CalificacionesService;
  let prisma: {
    calificacionPelicula: { delete: jest.Mock; findUnique: jest.Mock };
    peliculas: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      calificacionPelicula: { delete: jest.fn(), findUnique: jest.fn() },
      peliculas: { findUnique: jest.fn() },
    };
    service = new CalificacionesService(
      prisma as unknown as PrismaService,
      buildAuditLog(),
    );
  });

  it('borra la calificación y devuelve rating actualizado', async () => {
    prisma.calificacionPelicula.findUnique = jest
      .fn()
      .mockResolvedValue({ puntuacion: 5 });
    prisma.calificacionPelicula.delete = jest
      .fn()
      .mockResolvedValue({ id: 1n });
    prisma.peliculas = {
      findUnique: jest
        .fn()
        .mockResolvedValue({ rating_promedio: 4.2, rating_count: 9 }),
    };
    const r = await service.borrar(1n, 2n);
    expect(r).toEqual({ rating_promedio: 4.2, rating_count: 9 });
  });

  it('lanza NotFound si no existe', async () => {
    prisma.calificacionPelicula.findUnique = jest
      .fn()
      .mockResolvedValue(null);
    prisma.calificacionPelicula.delete = jest
      .fn()
      .mockRejectedValue({ code: 'P2025' });
    await expect(service.borrar(1n, 2n)).rejects.toThrow('NotFound');
  });
});

import { CalificacionesService } from './calificaciones.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CalificacionesService.obtenerMia', () => {
  let service: CalificacionesService;
  let prisma: { calificacionPelicula: { findUnique: jest.Mock } };

  beforeEach(() => {
    prisma = { calificacionPelicula: { findUnique: jest.fn() } };
    service = new CalificacionesService(prisma as unknown as PrismaService);
  });

  it('devuelve la puntuación cuando existe', async () => {
    prisma.calificacionPelicula.findUnique.mockResolvedValue({ puntuacion: 4 });
    const r = await service.obtenerMia(1n, 2n);
    expect(r).toEqual({ puntuacion: 4 });
  });

  it('lanza NotFound cuando no existe', async () => {
    prisma.calificacionPelicula.findUnique.mockResolvedValue(null);
    await expect(service.obtenerMia(1n, 2n)).rejects.toThrow('NotFound');
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
    service = new CalificacionesService(prisma as unknown as PrismaService);
  });

  it('lanza 403 si el usuario no asistió a una función pasada', async () => {
    prisma.reservas = { findFirst: jest.fn().mockResolvedValue(null) };
    await expect(service.calificar(1n, 2n, 4)).rejects.toThrow('Forbidden');
  });

  it('hace upsert y devuelve rating actualizado', async () => {
    prisma.reservas = {
      findFirst: jest.fn().mockResolvedValue({ id: 99n }),
    };
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
    calificacionPelicula: { delete: jest.Mock };
    peliculas: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      calificacionPelicula: { delete: jest.fn() },
      peliculas: { findUnique: jest.fn() },
    };
    service = new CalificacionesService(prisma as unknown as PrismaService);
  });

  it('borra la calificación y devuelve rating actualizado', async () => {
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
    prisma.calificacionPelicula.delete = jest
      .fn()
      .mockRejectedValue({ code: 'P2025' });
    await expect(service.borrar(1n, 2n)).rejects.toThrow('NotFound');
  });
});

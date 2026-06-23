import { Test } from '@nestjs/testing';
import { PeliculaService } from './pelicula.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CloudinaryService } from './cloudinary.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('PeliculaService (audit-log instrumentation)', () => {
  let service: PeliculaService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };
  let mail: { sendNuevaPeliculaEmail: jest.Mock };
  let cloudinary: { uploadPoster: jest.Mock };

  beforeEach(async () => {
    prisma = {
      peliculas: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      calificacionPelicula: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      usuarios: {
        findUnique: jest.fn().mockResolvedValue({ id: 1n }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      idiomas: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
      generos: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    mail = { sendNuevaPeliculaEmail: jest.fn().mockResolvedValue(undefined) };
    cloudinary = { uploadPoster: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        PeliculaService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
        { provide: CloudinaryService, useValue: cloudinary },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(PeliculaService);
  });

  describe('findOne', () => {
    it('incluye mi_calificacion cuando se pasa idUsuario y hay voto', async () => {
      prisma.peliculas.findUnique.mockResolvedValueOnce({
        id: 1n,
        rating_promedio: 4.3,
        rating_count: 10,
      });
      prisma.calificacionPelicula.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ puntuacion: 5 });

      const r = await service.findOne(1n, 99n);

      expect(r.mi_calificacion).toBe(5);
    });

    it('mi_calificacion es null cuando el usuario no votó', async () => {
      prisma.peliculas.findUnique.mockResolvedValueOnce({
        id: 1n,
        rating_promedio: 4.3,
        rating_count: 10,
      });
      prisma.calificacionPelicula.findUnique = jest
        .fn()
        .mockResolvedValueOnce(null);

      const r = await service.findOne(1n, 99n);

      expect(r.mi_calificacion).toBeNull();
    });

    it('mi_calificacion es null cuando no se pasa idUsuario', async () => {
      prisma.peliculas.findUnique.mockResolvedValueOnce({
        id: 1n,
        rating_promedio: 4.3,
        rating_count: 10,
      });

      const r = await service.findOne(1n);

      expect(r.mi_calificacion).toBeNull();
      expect(prisma.calificacionPelicula.findUnique).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si la película no existe', async () => {
      prisma.peliculas.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999n)).rejects.toThrow(
        'Película no encontrada',
      );
    });
  });

  it('createPelicula: registra auditoría con entidad/entidad_id/valor_nuevo', async () => {
    prisma.peliculas.create.mockResolvedValueOnce({
      id: 42n,
      titulo: 'Inception',
      sinopsis: 'Sueños',
      poster_url: null,
      fecha_estreno: new Date('2023-07-16T00:00:00Z'),
      id_idioma: 1n,
      id_genero: 2n,
      activo: false,
      generos: { nombre: 'Sci-Fi' },
      idiomas: { nombre: 'Inglés' },
    });

    await service.createPelicula(
      {
        titulo: 'Inception',
        sinopsis: 'Sueños',
        id_idioma: 1n,
        id_genero: 2n,
        fecha_estreno: '2023-07-16',
        activo: false,
      },
      9n,
    );

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PELICULA_CREAR',
        entidad: 'Pelicula',
        entidad_id: 42n,
        valor_nuevo: expect.objectContaining({
          titulo: 'Inception',
          genero_nombre: 'Sci-Fi',
          idioma_nombre: 'Inglés',
          activo: false,
        }),
      }),
    );
  });

  it('updatePelicula: registra auditoría con valor_anterior y valor_nuevo', async () => {
    prisma.peliculas.findUnique.mockResolvedValueOnce({
      id: 7n,
      id_usuario: 3n,
      titulo: 'Old',
      sinopsis: 'OldSyn',
      fecha_estreno: new Date('2020-01-01T00:00:00Z'),
      id_idioma: 1n,
      id_genero: 2n,
      activo: true,
      generos: { nombre: 'Drama' },
      idiomas: { nombre: 'Español' },
    });
    prisma.peliculas.update.mockResolvedValueOnce({
      id: 7n,
      titulo: 'New',
      sinopsis: 'NewSyn',
      poster_url: null,
      fecha_estreno: new Date('2020-02-02T00:00:00Z'),
      id_idioma: 1n,
      id_genero: 3n,
      activo: true,
      generos: { id: 3n, nombre: 'Acción' },
      idiomas: { id: 1n, nombre: 'Español' },
    });

    await service.updatePelicula('7', { titulo: 'New' }, 9n);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PELICULA_EDITAR',
        entidad: 'Pelicula',
        entidad_id: 7n,
        valor_anterior: expect.objectContaining({
          titulo: 'Old',
          genero_nombre: 'Drama',
        }),
        valor_nuevo: expect.objectContaining({
          titulo: 'New',
          genero_nombre: 'Acción',
        }),
      }),
    );
  });

  it('toggleActivo: registra auditoría con valor_anterior y valor_nuevo', async () => {
    prisma.peliculas.findUnique.mockResolvedValueOnce({
      id: 11n,
      id_usuario: 3n,
      titulo: 'Movie',
      sinopsis: null,
      fecha_estreno: null,
      id_idioma: null,
      id_genero: null,
      activo: true,
      generos: null,
      idiomas: null,
    });
    prisma.peliculas.update.mockResolvedValueOnce({
      id: 11n,
      titulo: 'Movie',
      sinopsis: null,
      fecha_estreno: null,
      id_idioma: null,
      id_genero: null,
      activo: false,
      generos: null,
      idiomas: null,
    });

    await service.toggleActivo('11', 9n);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PELICULA_TOGGLE',
        entidad: 'Pelicula',
        entidad_id: 11n,
        valor_anterior: expect.objectContaining({ activo: true }),
        valor_nuevo: expect.objectContaining({ activo: false }),
      }),
    );
  });
});

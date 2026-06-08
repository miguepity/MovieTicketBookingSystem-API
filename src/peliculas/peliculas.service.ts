import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PeliculasService {
  private readonly logger = new Logger(PeliculasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(createPeliculaDto: CreatePeliculaDto) {
    const pelicula = await this.prisma.peliculas.create({
      data: { ...createPeliculaDto },
      include: {
        generos: { select: { nombre: true } },
      },
    });

    // Obtener todos los usuarios activos para notificar
    const usuarios = await this.prisma.usuarios.findMany({
      where: { estado: 'activo', notificaciones_activas: true },
      select: { nombre: true, email: true },
    });

    // Enviar emails sin bloquear la respuesta
    Promise.allSettled(
      usuarios.map((u) =>
        this.emailService.sendNuevaPelicula(
          u.email,
          u.nombre,
          pelicula.titulo,
          pelicula.generos?.nombre ?? 'Sin género',
          pelicula.fecha_estreno ?? new Date(),
          `${process.env.APP_URL}/peliculas/${pelicula.id}`,
        ),
      ),
    ).then((resultados) => {
      const fallidos = resultados.filter((r) => r.status === 'rejected').length;
      if (fallidos > 0) {
        this.logger.error(`${fallidos} email(s) de nueva película fallaron`);
      }
    });

    return pelicula;
  }

  findAll() {
    return this.prisma.peliculas.findMany();
  }

  findOne(id: number) {
    return this.prisma.peliculas.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePeliculaDto: UpdatePeliculaDto) {
    return this.prisma.peliculas.update({
      where: { id },
      data: { ...updatePeliculaDto },
    });
  }

  remove(id: number) {
    return this.prisma.peliculas.delete({
      where: { id },
    });
  }

  async uploadPoster(id: number, file: { filename: string }) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    const pelicula = await this.prisma.peliculas.findUnique({ where: { id } });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    return this.prisma.peliculas.update({
      where: { id },
      data: { poster_url: `/uploads/posters/${file.filename}` },
    });
  }
}

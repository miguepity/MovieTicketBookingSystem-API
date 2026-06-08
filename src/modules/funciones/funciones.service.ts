import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';

@Injectable()
export class FuncionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFuncionDto) {
    const fecha = new Date(dto.fecha_hora);


    const conflicto = await this.prisma.funciones.findFirst({
      where: {
        id_sala: BigInt(dto.id_sala),
        fecha_hora: fecha,
      },
      select: {
        id: true,
      },
    });

    if (conflicto) {
      throw new ConflictException(
        'Ya existe una función programada para esa sala y horario',
      );
    }

    const funcion = await this.prisma.funciones.create({
      data: {
        id_pelicula: BigInt(dto.id_pelicula),
        id_sala: BigInt(dto.id_sala),
        fecha_hora: fecha,
        estado: dto.estado,
      },
    });

    await this.generarAsientos(funcion.id);

    return funcion;
  }

  async generarAsientos(id_funcion: bigint) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: {
        salas: {
          include: {
            asientos: true,
          },
        },
      },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    if (!funcion.salas) {
      throw new NotFoundException('La función no tiene sala asignada');
    }

    const data = funcion.salas.asientos.map((a) => ({
      id_asiento: a.id,
      id_funcion,
      estado: 'DISPONIBLE',
      id_usuario: null,
      version: 1,
      bloqueado_hasta: new Date(),
    }));

    return this.prisma.asientosFuncion.createMany({ data });
  }

  findAll() {
    return this.prisma.funciones.findMany({
      include: {
        peliculas: true,
        salas: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        peliculas: true,
        salas: true,
        asientosFuncions: true,
      },
    });
  }
}

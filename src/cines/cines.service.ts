import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCineDto } from './dto/create-cine.dto';

@Injectable()
export class CinesService {
  constructor(private readonly prisma: PrismaService) {}

  async crearCine(dto: CreateCineDto) {
    // Verificar que la ciudad existe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const ciudad = await this.prisma.ciudades.findUnique({
      where: { id: BigInt(dto.id_ciudad) },
    });

    if (!ciudad) {
      throw new NotFoundException(
        `Ciudad con id ${dto.id_ciudad} no encontrada`,
      );
    }

    // Verificar nombre unico por ciudad
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cineExistente = await this.prisma.cines.findFirst({
      where: {
        nombre: dto.nombre,
        id_ciudad: BigInt(dto.id_ciudad),
      },
    });

    if (cineExistente) {
      throw new ConflictException(
        `Ya existe un cine con ese nombre en esta ciudad`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.cines.create({
      data: {
        nombre: dto.nombre,
        direccion: dto.direccion,
        id_ciudad: BigInt(dto.id_ciudad),
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        created_at: true,
      },
    });
  }
  async getCine(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        created_at: true,
        salas: {
          select: {
            id: true,
            nombre: true,
            filas: true,
            columnas: true,
          },
          orderBy: { nombre: 'asc' },
        },
      },
    });

    if (!cine) {
      throw new NotFoundException(`Cine con id ${id} no encontrado`);
    }

    return cine;
  }
}

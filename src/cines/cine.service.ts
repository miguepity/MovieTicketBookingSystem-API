import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCineDto } from './create-cine.dto';
import { UpdateCineDto } from './update-cine.dto';

@Injectable()
export class CinesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeCine(cine: any) {
  return {
    ...cine,
    id: Number(cine.id),
    id_ciudad: Number(cine.id_ciudad),
    ciudades: cine.ciudades 
      ? { ...cine.ciudades, id: Number(cine.ciudades.id) } 
      : undefined,
  };
}

  async create(createCineDto: CreateCineDto) {
    
    const ciudadExiste = await this.prisma.ciudades.findUnique({
      where: { id: BigInt(createCineDto.id_ciudad) },
    });
    if (!ciudadExiste) {
      throw new NotFoundException(`La ciudad con ID ${createCineDto.id_ciudad} no existe`);
    }

    const cineDuplicado = await this.prisma.cines.findFirst({
      where: {
        nombre: createCineDto.nombre,
        id_ciudad: BigInt(createCineDto.id_ciudad),
      },
    });
    if (cineDuplicado) {
      throw new ConflictException('Ya existe un cine con ese nombre en esta ciudad');
    }

    const nuevoCine = await this.prisma.cines.create({
      data: {
        nombre: createCineDto.nombre,
        direccion: createCineDto.direccion,
        id_ciudad: BigInt(createCineDto.id_ciudad),
      },
    });

    return this.serializeCine(nuevoCine);
  }

  async findAll() {
    const cines = await this.prisma.cines.findMany({
      include: { ciudades: true },
    });
    return cines.map((cine) => this.serializeCine(cine));
  }

  async findOne(id: number) {
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
      include: { ciudades: true },
    });
    if (!cine) {
      throw new NotFoundException(`El cine con ID ${id} no existe`);
    }
    return this.serializeCine(cine);
  }

  async update(id: number, updateCineDto: UpdateCineDto) {
    const cineActual = await this.prisma.cines.findUnique({
      where: { id: BigInt(id) },
    });
    if (!cineActual) {
      throw new NotFoundException(`El cine con ID ${id} no existe`);
    }

   
    const funcionesActivas = await this.prisma.funciones.findFirst({
      where: {
        id_sala: {
          in: await this.prisma.salas.findMany({
            where: { id_cine: BigInt(id) },
            select: { id: true },
          }).then(salas => salas.map(s => s.id)),
        },
        fecha_hora: {
          gte: new Date(), 
        },
        estado: { not: 'CANCELADA' } 
    },
    });


    if (funcionesActivas) {
      throw new BadRequestException(
        'No se puede modificar el cine porque tiene funciones activas o próximas carteleras vigentes.',
      );
    }

    const ciudadId = updateCineDto.id_ciudad ? BigInt(updateCineDto.id_ciudad) : cineActual.id_ciudad;
    const nombreCine = updateCineDto.nombre || cineActual.nombre;

    if (updateCineDto.nombre || updateCineDto.id_ciudad) {
      const duplicado = await this.prisma.cines.findFirst({
        where: {
          nombre: nombreCine,
          id_ciudad: ciudadId,
          id: { not: BigInt(id) },
        },
      });
      if (duplicado) {
        throw new ConflictException('Ya existe otro cine con ese nombre en la ciudad destino');
      }
    }

    const cineActualizado = await this.prisma.cines.update({
      where: { id: BigInt(id) },
      data: {
        nombre: updateCineDto.nombre,
        direccion: updateCineDto.direccion,
        id_ciudad: updateCineDto.id_ciudad ? BigInt(updateCineDto.id_ciudad) : undefined,
      },
    });

    return this.serializeCine(cineActualizado);
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.prisma.cines.delete({
        where: { id: BigInt(id) },
      });
      return { message: `Cine con ID ${id} eliminado exitosamente` };
    } catch (error) {
      throw new ConflictException('No se puede eliminar el cine porque contiene salas o registros asociados.');
    }
  }
}
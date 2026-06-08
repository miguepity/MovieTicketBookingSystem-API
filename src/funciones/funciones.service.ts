import { Injectable } from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FuncionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFuncioneDto: CreateFuncioneDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create the function
      const funcion = await tx.funciones.create({
        data: {
          id_pelicula: BigInt(createFuncioneDto.id_pelicula),
          id_sala: BigInt(createFuncioneDto.id_sala),
          fecha_hora: new Date(createFuncioneDto.fecha_hora),
          estado: 'active',
        },
      });

      // 2. Get all seats for the room
      const asientos = await tx.asientos.findMany({
        where: { id_sala: BigInt(createFuncioneDto.id_sala) },
      });

      // 3. Create AsientosFuncion for each seat
      if (asientos.length > 0) {
        await tx.asientosFuncion.createMany({
          data: asientos.map((asiento) => ({
            id_asiento: asiento.id,
            id_funcion: funcion.id,
            estado: 'disponible',
            version: 1,
          })),
        });
      }

      return funcion;
    });
  }
}

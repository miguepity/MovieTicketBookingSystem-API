import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async crearSala(idCine: number, dto: CreateSalaDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(idCine) },
    });

    if (!cine) {
      throw new NotFoundException(`Cine con id ${idCine} no encontrado`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sala = await this.prisma.salas.create({
      data: {
        nombre: dto.nombre,
        filas: dto.filas,
        columnas: dto.columnas,
        id_cine: BigInt(idCine),
      },
      select: {
        id: true,
        nombre: true,
        filas: true,
        columnas: true,
        id_cine: true,
      },
    });

    const asientos: {
      id_sala: bigint;
      fila: string;
      columna: number;
      codigo: string;
      tipo: string;
    }[] = [];
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let fila = 0; fila < dto.filas; fila++) {
      for (let col = 1; col <= dto.columnas; col++) {
        const letraFila = letras[fila];
        asientos.push({
          id_sala: sala.id,
          fila: letraFila,
          columna: col,
          codigo: `${letraFila}${col}`,
          tipo: 'normal',
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.asientos.createMany({ data: asientos });

    return {
      ...sala,
      asientos_generados: asientos.length,
    };
  }
}

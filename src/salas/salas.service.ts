import { Injectable, NotFoundException } from '@nestjs/common';
import { BodyDto } from './dto/salas.body.dto';
import { ParamDto } from './dto/salas.param.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalaService {
  constructor(private readonly prisma: PrismaService) {}

  async createSala(dto: BodyDto) {
    const findCine = await this.prisma.cines.findFirst({
      where: { id: BigInt(dto.id_cine) },
    });
    if (!findCine) {
      throw new NotFoundException('Cine not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const newSala = await tx.salas.create({
        data: {
          nombre: dto.nombre,
          filas: dto.filas,
          columnas: dto.columnas,
          id_cine: BigInt(dto.id_cine),
        },
      });

      const asientos: {
        id_sala: bigint;
        fila: string;
        columna: number;
        codigo: string;
        tipo: string;
      }[] = [];

      for (let f = 0; f < dto.filas; f++) {
        const fila = String.fromCharCode(65 + f);
        const tipo = f === 0 ? 'VIP' : 'ESTANDAR';
        for (let c = 1; c <= dto.columnas; c++) {
          asientos.push({
            id_sala: newSala.id,
            fila,
            columna: c,
            codigo: `${fila}-${String(c).padStart(2, '0')}`,
            tipo,
          });
        }
      }

      await tx.asientos.createMany({ data: asientos });

      // Retornamos mapeando el ID a string para evitar conflictos de serialización con BigInt
      return {
        ...newSala,
        id: newSala.id.toString(),
        id_cine: newSala.id_cine.toString(),
      };
    });
  }

  async getSalas() {
    const salas = await this.prisma.salas.findMany({
      include: { cines: true },
    });
    if (salas.length === 0) {
      throw new NotFoundException('Salas is empty');
    }
    return salas.map((sala) => ({
      ...sala,
      id: sala.id.toString(),
      id_cine: sala.id_cine.toString(),
      cineNombre: sala.cines.nombre,
    }));
  }

  async getSalaById(dto: ParamDto) {
    const findSala = await this.prisma.salas.findFirst({
      where: { id: BigInt(dto.id) },
    });
    if (!findSala) {
      throw new NotFoundException('Sala not found');
    }
    return {
      ...findSala,
      id: findSala.id.toString(),
      id_cine: findSala.id_cine.toString(),
    };
  }

  async updateSala(dtoP: ParamDto, dtoB: BodyDto | UpdateSalaDto) {
    const findSala = await this.prisma.salas.findFirst({
      where: { id: BigInt(dtoP.id) },
    });
    if (!findSala) {
      throw new NotFoundException('Sala not found');
    }

    // Estructuramos la data dinámicamente para manejar BigInt si se envía id_cine
    const updateData: any = {
      ...(dtoB.nombre && { nombre: dtoB.nombre }),
      ...(dtoB.filas && { filas: dtoB.filas }),
      ...(dtoB.columnas && { columnas: dtoB.columnas }),
      ...(dtoB.id_cine && { id_cine: BigInt(dtoB.id_cine) }),
    };

    await this.prisma.salas.update({
      where: { id: BigInt(dtoP.id) },
      data: updateData,
    });

    return {
      success: true,
      message: 'Sala updated successfully',
    };
  }

  async deleteSala(dto: ParamDto) {
    const findSala = await this.prisma.salas.findFirst({
      where: { id: BigInt(dto.id) },
    });
    if (!findSala) {
      throw new NotFoundException('Sala not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.asientos.deleteMany({
        where: { id_sala: BigInt(dto.id) },
      });
      await tx.salas.delete({
        where: { id: BigInt(dto.id) },
      });
    });

    return {
      success: true,
      message: 'Sala deleted successfully',
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticaCancelacionDto } from './dto/update-politica-cancelacion.dto';

@Injectable()
export class PoliticasCancelacionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePoliticaCancelacionDto) {
    const politicasActivas = await this.prisma.politicaCancelacion.findMany();

    if (politicasActivas.length > 0) {
      await this.prisma.politicaCancelacion.deleteMany({});
    }
    const politica = await this.prisma.politicaCancelacion.create({
      data: {
        horas_antes_minimo: createDto.horas_antes_minimo,
        horas_antes_maximo: createDto.horas_antes_maximo ?? null,
        porcentaje_reembolso: createDto.porcentaje_reembolso,
      },
    });

    return this.mapPolitica(politica);
  }

  async findAll() {
    const politicas = await this.prisma.politicaCancelacion.findMany();
    return politicas.map((p) => this.mapPolitica(p));
  }

  async findOne(id: number) {
    const politica = await this.prisma.politicaCancelacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!politica) {
      throw new NotFoundException(
        `Política de cancelación con ID ${id} no encontrada`,
      );
    }

    return this.mapPolitica(politica);
  }

  async update(id: number, updateDto: UpdatePoliticaCancelacionDto) {
    await this.findOne(id);

    const politicaActualizada = await this.prisma.politicaCancelacion.update({
      where: { id: BigInt(id) },
      data: {
        ...updateDto,
      },
    });

    return this.mapPolitica(politicaActualizada);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.politicaCancelacion.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: `Política de cancelación con ID ${id} eliminada exitosamente`,
    };
  }

  private mapPolitica(politica: any) {
    return {
      ...politica,
      id: politica.id.toString(),
    };
  }
}

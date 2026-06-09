import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticaCancelacionDto } from './dto/update-politica-cancelacion.dto';

@Injectable()
export class PoliticaCancelacionService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.politicaCancelacion.findMany({
      orderBy: {
        horas_antes_minimo: 'asc',
      },
    });
  }

  async findById(id: number) {
    const politica = await this.prismaService.politicaCancelacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!politica) {
      throw new NotFoundException(
        `Política de cancelación con ID ${id} no encontrada`,
      );
    }

    return politica;
  }

  async create(createPoliticaCancelacionDto: CreatePoliticaCancelacionDto) {
    return await this.prismaService.politicaCancelacion.create({
      data: {
        ...createPoliticaCancelacionDto,
        porcentaje_reembolso: parseFloat(
          String(createPoliticaCancelacionDto.porcentaje_reembolso),
        ),
      },
    });
  }

  async update(
    id: number,
    updatePoliticaCancelacionDto: UpdatePoliticaCancelacionDto,
  ) {
    const politica = await this.prismaService.politicaCancelacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!politica) {
      throw new NotFoundException(
        `Política de cancelación con ID ${id} no encontrada`,
      );
    }

    return await this.prismaService.politicaCancelacion.update({
      where: { id: BigInt(id) },
      data: {
        ...updatePoliticaCancelacionDto,
        ...(updatePoliticaCancelacionDto.porcentaje_reembolso && {
          porcentaje_reembolso: parseFloat(
            String(updatePoliticaCancelacionDto.porcentaje_reembolso),
          ),
        }),
      },
    });
  }

  async delete(id: number) {
    const politica = await this.prismaService.politicaCancelacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!politica) {
      throw new NotFoundException(
        `Política de cancelación con ID ${id} no encontrada`,
      );
    }

    return await this.prismaService.politicaCancelacion.delete({
      where: { id: BigInt(id) },
    });
  }
}

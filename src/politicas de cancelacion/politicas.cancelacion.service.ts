import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PoliticasBodyDto } from './dto/politicas.cancelacion.body.dto';
import { PoliticaParamDto } from './dto/politicas.cancelacion.param.dto';
import { UpdatePoliticasDto } from './dto/update-politicas.dto';

@Injectable()
export class PoliticasCancelacionService {
  constructor(private readonly prisma: PrismaService) {}

  // Formateador interno para convertir BigInt a String y evitar errores JSON
  private formatPolitica(politica: any) {
    return {
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: Number(politica.porcentaje_reembolso),
    };
  }

  async getPoliticas() {
    const politicas = await this.prisma.politicaCancelacion.findMany();
    if (politicas.length === 0) {
      throw new NotFoundException(
        'No existen políticas de cancelación registradas.',
      );
    }
    return politicas.map((p) => this.formatPolitica(p));
  }

  async createPoliticas(dto: PoliticasBodyDto) {
    const newPolitica = await this.prisma.politicaCancelacion.create({
      data: {
        horas_antes_minimo: dto.horas_antes_minimo,
        horas_antes_maximo: dto.horas_antes_maximo,
        porcentaje_reembolso: dto.porcentaje_reembolso,
      },
    });
    return this.formatPolitica(newPolitica);
  }

  async updatePoliticas(
    dtoP: PoliticaParamDto,
    dtoB: PoliticasBodyDto | UpdatePoliticasDto,
  ) {
    const findPoliticas = await this.prisma.politicaCancelacion.findUnique({
      where: { id: BigInt(dtoP.id) },
    });

    if (!findPoliticas) {
      throw new NotFoundException('Política de cancelación no encontrada.');
    }

    // Construcción limpia y dinámica del objeto de actualización
    const updateData: any = {
      ...(dtoB.horas_antes_minimo !== undefined && {
        horas_antes_minimo: dtoB.horas_antes_minimo,
      }),
      ...(dtoB.horas_antes_maximo !== undefined && {
        horas_antes_maximo: dtoB.horas_antes_maximo,
      }),
      ...(dtoB.porcentaje_reembolso !== undefined && {
        porcentaje_reembolso: dtoB.porcentaje_reembolso,
      }),
    };

    const updated = await this.prisma.politicaCancelacion.update({
      where: { id: BigInt(dtoP.id) },
      data: updateData,
    });

    return {
      success: true,
      message: 'Política de cancelación actualizada con éxito.',
      data: this.formatPolitica(updated),
    };
  }

  async removePoliticas(dtoP: PoliticaParamDto) {
    const findPolitica = await this.prisma.politicaCancelacion.findUnique({
      where: { id: BigInt(dtoP.id) },
    });

    if (!findPolitica) {
      throw new NotFoundException('Política de cancelación no encontrada.');
    }

    await this.prisma.politicaCancelacion.delete({
      where: { id: BigInt(dtoP.id) },
    });

    return {
      success: true,
      message: 'Política de cancelación eliminada con éxito.',
    };
  }
}

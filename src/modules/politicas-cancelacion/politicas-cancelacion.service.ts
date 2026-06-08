import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePoliticasCancelacionDto } from './dto/update-politicas-cancelacion.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PoliticaCancelacion, Prisma } from '../../../generated/prisma/client';
import { ListPoliticasCancelacionQueryDto } from './dto/list-politicas-cancelacion-query.dto';
import { PoliticasCancelacionPageResponseDto } from './dto/politicas-cancelacion-page.response.dto';
import { PoliticasCancelacionListItemResponseDto } from './dto/politicas-cancelacion-list-item.response.dto';

@Injectable()
export class PoliticasCancelacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListPoliticasCancelacionQueryDto,
  ): Promise<PoliticasCancelacionPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PoliticaCancelacionWhereInput = {};

    const [total, politicas] = await this.prisma.$transaction([
      this.prisma.politicaCancelacion.count({ where }),
      this.prisma.politicaCancelacion.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: politicas.map((politica) => this.toListItem(politica)),
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    updatePoliticasCancelacionDto: UpdatePoliticasCancelacionDto,
  ) {
    const politicasCancelacionId = this.parseId(id);

    const existing = await this.prisma.politicaCancelacion.findUnique({
      where: { id: politicasCancelacionId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Política de cancelación no encontrada');
    }

    return this.prisma.politicaCancelacion.update({
      where: { id: politicasCancelacionId },
      data: {
        horas_antes_minimo: updatePoliticasCancelacionDto.horas_antes_minimo,
        horas_antes_maximo: updatePoliticasCancelacionDto.horas_antes_maximo,
        porcentaje_reembolso:
          updatePoliticasCancelacionDto.porcentaje_reembolso !== undefined
            ? new Prisma.Decimal(
                updatePoliticasCancelacionDto.porcentaje_reembolso,
              )
            : undefined,
      },
    });
  }

  private toListItem(
    politica: PoliticaCancelacion,
  ): PoliticasCancelacionListItemResponseDto {
    return {
      id: politica.id.toString(),
      horas_antes_minimo: politica.horas_antes_minimo,
      horas_antes_maximo: politica.horas_antes_maximo,
      porcentaje_reembolso: Number(politica.porcentaje_reembolso),
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}

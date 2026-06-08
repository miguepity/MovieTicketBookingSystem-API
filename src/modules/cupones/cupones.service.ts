import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarCodigoUnico(codigo: string, excludeId?: bigint) {
    const existente = await this.prisma.cupones.findFirst({
      where: {
        codigo,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existente) {
      throw new ConflictException('Ya existe un cupón con ese código');
    }
  }

  async create(dto: CreateCuponDto) {
    await this.validarCodigoUnico(dto.codigo);

    return this.prisma.cupones.create({
      data: {
        codigo: dto.codigo,
        tipo: dto.tipo,
        valor: dto.valor,
        fecha_expiracion: new Date(dto.fecha_expiracion),
        usos_maximos: dto.usos_maximos,
      },
    });
  }

  findAll() {
    return this.prisma.cupones.findMany();
  }

  findOne(id: string) {
    return this.prisma.cupones.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async update(id: string, dto: UpdateCuponDto) {
    const cuponId = BigInt(id);

    const cupon = await this.prisma.cupones.findUnique({
      where: { id: cuponId },
    });

    if (!cupon) {
      throw new NotFoundException('Cupón no existe');
    }

    if (dto.codigo) {
      await this.validarCodigoUnico(dto.codigo, cuponId);
    }

    return this.prisma.cupones.update({
      where: { id: cuponId },
      data: {
        codigo: dto.codigo,
        tipo: dto.tipo,
        valor: dto.valor,
        fecha_expiracion: dto.fecha_expiracion
          ? new Date(dto.fecha_expiracion)
          : undefined,
        usos_maximos: dto.usos_maximos,
      },
    });
  }
}

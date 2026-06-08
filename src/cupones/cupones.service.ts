import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(private prismaService: PrismaService) {}

  async create(createCuponDto: CreateCuponDto) {
    const codigoExistente = await this.prismaService.cupones.findUnique({
      where: { codigo: createCuponDto.codigo },
    });

    if (codigoExistente) {
      throw new BadRequestException(
        `El código de cupón '${createCuponDto.codigo}' ya existe`,
      );
    }

    return await this.prismaService.cupones.create({
      data: {
        ...createCuponDto,
        valor: parseFloat(String(createCuponDto.valor)),
      },
    });
  }

  async findAll() {
    return await this.prismaService.cupones.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id: number) {
    const cupon = await this.prismaService.cupones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }

    return cupon;
  }

  async update(id: number, updateCuponDto: UpdateCuponDto) {
    const cupon = await this.prismaService.cupones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }

    if (updateCuponDto.codigo && updateCuponDto.codigo !== cupon.codigo) {
      const codigoExistente = await this.prismaService.cupones.findUnique({
        where: { codigo: updateCuponDto.codigo },
      });

      if (codigoExistente) {
        throw new BadRequestException(
          `El código de cupón '${updateCuponDto.codigo}' ya existe`,
        );
      }
    }

    return await this.prismaService.cupones.update({
      where: { id: BigInt(id) },
      data: {
        ...updateCuponDto,
        ...(updateCuponDto.valor && {
          valor: parseFloat(String(updateCuponDto.valor)),
        }),
      },
    });
  }

  async delete(id: number) {
    const cupon = await this.prismaService.cupones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }

    return await this.prismaService.cupones.delete({
      where: { id: BigInt(id) },
    });
  }

  async validate(codigo: string) {
    const cupon = await this.prismaService.cupones.findUnique({
      where: { codigo },
    });

    if (!cupon) {
      throw new NotFoundException(`Cupón con código '${codigo}' no encontrado`);
    }

    if (!cupon.activo) {
      throw new BadRequestException(
        `El cupón con código '${codigo}' no está activo`,
      );
    }

    const ahora = new Date();
    if (cupon.fecha_expiracion < ahora) {
      throw new BadRequestException(
        `El cupón con código '${codigo}' ha expirado`,
      );
    }

    if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
      throw new BadRequestException(
        `El cupón con código '${codigo}' ha alcanzado el máximo de usos`,
      );
    }

    return {
      tipo: cupon.tipo,
      valor: cupon.valor.toString(),
    };
  }

  async toggleStatus(id: number) {
    const cupon = await this.prismaService.cupones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }

    return await this.prismaService.cupones.update({
      where: { id: BigInt(id) },
      data: {
        activo: !cupon.activo,
      },
    });
  }
}

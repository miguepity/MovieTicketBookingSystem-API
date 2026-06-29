import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuponeDto } from './dto/create-cupones.dto';
import { UpdateCuponeDto } from './dto/update-cupones.dto';
import { ValidarCuponDto } from './dto/validar-cupon.dto';
import { ActualizarEstadoCuponDto } from './dto/actualizar-estado-cupon.dto';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class CuponesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCuponDto: CreateCuponeDto) {
    // Verificar si el código ya existe
    const cuponExistente = await this.prisma.cupones.findUnique({
      where: { codigo: createCuponDto.codigo },
    });

    if (cuponExistente) {
      throw new BadRequestException(
        'El código de cupón ya existe en el sistema',
      );
    }

    // Validar que la fecha de expiración sea en el futuro
    const fechaExpiracion = new Date(createCuponDto.fecha_expiracion);
    if (fechaExpiracion < new Date()) {
      throw new BadRequestException(
        'La fecha de expiración no puede ser en el pasado',
      );
    }

    return await this.prisma.cupones.create({
      data: {
        codigo: createCuponDto.codigo,
        tipo: createCuponDto.tipo,
        valor: new Decimal(createCuponDto.valor),
        fecha_expiracion: fechaExpiracion,
        usos_maximos: createCuponDto.usos_maximos || null,
        activo: createCuponDto.activo !== false,
      },
    });
  }

  async findAll() {
    return await this.prisma.cupones.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const cupon = await this.prisma.cupones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!cupon) {
      throw new NotFoundException(`El cupón con ID ${id} no existe`);
    }

    return cupon;
  }

  async update(id: number, updateCuponDto: UpdateCuponeDto) {
    // Verificar que el cupón existe
    await this.findOne(id);

    // Si se proporciona un código nuevo, verificar que no exista
    if (updateCuponDto.codigo) {
      const cuponExistente = await this.prisma.cupones.findUnique({
        where: { codigo: updateCuponDto.codigo },
      });

      if (cuponExistente && cuponExistente.id !== BigInt(id)) {
        throw new BadRequestException(
          'El código de cupón ya existe en el sistema',
        );
      }
    }

    // Validar fecha de expiración si se proporciona
    if (updateCuponDto.fecha_expiracion) {
      const fechaExpiracion = new Date(updateCuponDto.fecha_expiracion);
      if (fechaExpiracion < new Date()) {
        throw new BadRequestException(
          'La fecha de expiración no puede ser en el pasado',
        );
      }
    }

    const dataUpdate: any = {};

    if (updateCuponDto.codigo) dataUpdate.codigo = updateCuponDto.codigo;
    if (updateCuponDto.tipo) dataUpdate.tipo = updateCuponDto.tipo;
    if (updateCuponDto.valor)
      dataUpdate.valor = new Decimal(updateCuponDto.valor);
    if (updateCuponDto.fecha_expiracion)
      dataUpdate.fecha_expiracion = new Date(updateCuponDto.fecha_expiracion);
    if (updateCuponDto.usos_maximos !== undefined)
      dataUpdate.usos_maximos = updateCuponDto.usos_maximos;

    return await this.prisma.cupones.update({
      where: { id: BigInt(id) },
      data: dataUpdate,
    });
  }

  async remove(id: number) {
    // Verificar que el cupón existe
    await this.findOne(id);

    return await this.prisma.cupones.delete({
      where: { id: BigInt(id) },
    });
  }

  async validar(validarCuponDto: ValidarCuponDto) {
    const cupon = await this.prisma.cupones.findUnique({
      where: { codigo: validarCuponDto.codigo },
    });

    if (!cupon) {
      return {
        valido: false,
        mensaje: 'El cupón no existe',
      };
    }

    if (!cupon.activo) {
      return {
        valido: false,
        mensaje: 'El cupón está inactivo',
      };
    }

    const ahora = new Date();
    if (cupon.fecha_expiracion < ahora) {
      return {
        valido: false,
        mensaje: 'El cupón ha expirado',
      };
    }

    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      return {
        valido: false,
        mensaje: 'El cupón ha alcanzado su límite de usos',
      };
    }

    return {
      valido: true,
      mensaje: 'El cupón es válido',
      cupon: {
        id: cupon.id,
        codigo: cupon.codigo,
        tipo: cupon.tipo,
        valor: cupon.valor,
        usos_restantes:
          cupon.usos_maximos !== null
            ? cupon.usos_maximos - cupon.usos_actuales
            : null,
      },
    };
  }

  async cambiarEstado(
    id: number,
    actualizarEstadoDto: ActualizarEstadoCuponDto,
  ) {
    // Verificar que el cupón existe
    await this.findOne(id);

    return await this.prisma.cupones.update({
      where: { id: BigInt(id) },
      data: {
        activo: actualizarEstadoDto.activo,
      },
    });
  }
}

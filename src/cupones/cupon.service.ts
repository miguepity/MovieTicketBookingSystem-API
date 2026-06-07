import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuponDto } from './create-cupon.dto';
import { UpdateCuponDto } from './update-cupon.dto';
import { ValidarCuponDto } from './validar-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(private readonly prisma: PrismaService) {}

  
  async create(createCuponDto: CreateCuponDto) {
    const codigoFormateado = createCuponDto.codigo.toUpperCase().trim();

    const existente = await this.prisma.cupones.findUnique({
      where: { codigo: codigoFormateado },
    });
    if (existente) {
      throw new ConflictException(`El cupón con código '${codigoFormateado}' ya se encuentra registrado.`);
    }

    return await this.prisma.cupones.create({
      data: {
        ...createCuponDto,
        codigo: codigoFormateado,
        fecha_expiracion: new Date(createCuponDto.fecha_expiracion),
      },
    });
  }

  async findAll() {
    return await this.prisma.cupones.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const cupon = await this.prisma.cupones.findUnique({
      where: { id: BigInt(id) },
    });
    if (!cupon) throw new NotFoundException(`El cupón con ID ${id} no existe.`);
    return cupon;
  }

  async update(id: number, updateCuponDto: UpdateCuponDto) {
    await this.findOne(id);

    if (updateCuponDto.codigo) {
      const codigoFormateado = updateCuponDto.codigo.toUpperCase().trim();
      const existente = await this.prisma.cupones.findUnique({
        where: { codigo: codigoFormateado },
      });
      if (existente && Number(existente.id) !== id) {
        throw new ConflictException(`Ya existe otro cupón registrado con el código '${codigoFormateado}'.`);
      }
      updateCuponDto.codigo = codigoFormateado;
    }

    return await this.prisma.cupones.update({
      where: { id: BigInt(id) },
      data: {
        ...updateCuponDto,
        fecha_expiracion: updateCuponDto.fecha_expiracion ? new Date(updateCuponDto.fecha_expiracion) : undefined,
      },
    });
  }

  async toggleStatus(id: number) {
    const cupon = await this.findOne(id);

    return await this.prisma.cupones.update({
      where: { id: BigInt(id) },
      data: { activo: !cupon.activo },
    });
  }

  async validar(validarCuponDto: ValidarCuponDto) {
    const codigoBusqueda = validarCuponDto.codigo.toUpperCase().trim();

    const cupon = await this.prisma.cupones.findUnique({
      where: { codigo: codigoBusqueda },
    });

    if (!cupon) {
      throw new NotFoundException('El cupón ingresado no existe.');
    }

    if (!cupon.activo) {
      throw new BadRequestException('El cupón ingresado se encuentra inactivo.');
    }

    const hoy = new Date();
    if (new Date(cupon.fecha_expiracion) < hoy) {
      throw new BadRequestException('El cupón ingresado ya ha expirado.');
    }

    if (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos) {
      throw new BadRequestException('El cupón ha alcanzado el límite máximo de usos permitidos.');
    }

    return {
      valido: true,
      id: Number(cupon.id),
      codigo: cupon.codigo,
      tipo: cupon.tipo, 
      valor: Number(cupon.valor),
      message: 'Cupón aplicado correctamente.',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.prisma.cupones.delete({
        where: { id: BigInt(id) },
      });
      return { message: `Cupón con ID ${id} eliminado correctamente.` };
    } catch {
      throw new ConflictException('No se puede eliminar el cupón porque registra un historial de pagos asociados.');
    }
  }
}
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuponDto } from './create-cupon.dto';
import { UpdateCuponDto } from './update-cupon.dto';
import { ValidarCuponDto } from './validar-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(private readonly prisma: PrismaService) {}

  
  async create(createCuponDto: CreateCuponDto, auditorId: number) {
    const codigoFormateado = createCuponDto.codigo.toUpperCase().trim();

    const fechaValida = this.validateFutureDate(createCuponDto.fecha_expiracion);

    const existente = await this.prisma.cupones.findUnique({
      where: { codigo: codigoFormateado },
    });
    if (existente) {
      throw new ConflictException(`El cupón con código '${codigoFormateado}' ya se encuentra registrado.`);
    }

    const nuevoCupon = await this.prisma.cupones.create({
      data: {
        ...createCuponDto,
        codigo: codigoFormateado,
        fecha_expiracion: fechaValida, 
      },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'CUPON_CREADO',
        detalle: `Cupón '${codigoFormateado}' creado`,
      },
    });

    return nuevoCupon;
  }

 async findAll(codigo?: string) {
  return await this.prisma.cupones.findMany({
    where: codigo ? {
      codigo: {
        contains: codigo, 
        mode: 'insensitive', 
      }
    } : {},
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

 async update(id: number, updateCuponDto: UpdateCuponDto, auditorId: number) {
  const cupon = await this.findOne(id);

  if (cupon.usos_actuales > 0) {
    throw new BadRequestException('No se puede editar un cupón que ya ha sido utilizado.');
  }

  const { fecha_expiracion, ...otrosDatos } = updateCuponDto;

  let fechaExpiracionDate: Date | undefined;
  if (fecha_expiracion) {
    fechaExpiracionDate = this.validateFutureDate(fecha_expiracion);
  }

  if (otrosDatos.codigo) {
    const codigoFormateado = otrosDatos.codigo.toUpperCase().trim();
    const existente = await this.prisma.cupones.findUnique({
      where: { codigo: codigoFormateado },
    });
    if (existente && Number(existente.id) !== id) {
      throw new ConflictException(`Ya existe otro cupón registrado con el código '${codigoFormateado}'.`);
    }
    otrosDatos.codigo = codigoFormateado;
  }

  const cuponActualizado = await this.prisma.cupones.update({
    where: { id: BigInt(id) },
    data: {
      ...otrosDatos,
      ...(fechaExpiracionDate && { fecha_expiracion: fechaExpiracionDate }),
    },
  });

  await this.prisma.auditLog.create({
    data: {
      id_usuario: BigInt(auditorId),
      id_auditor: BigInt(auditorId),
      accion: 'CUPON_ACTUALIZADO',
      detalle: `Cupón ${id} actualizado`,
    },
  });

  return cuponActualizado;
}

  async toggleStatus(id: number, auditorId: number) {
    const cupon = await this.findOne(id);
  const nuevoEstado = !cupon.activo;

  if (nuevoEstado === true) {
    const hoy = new Date();
    
    if (new Date(cupon.fecha_expiracion) < hoy) {
      throw new BadRequestException('No se puede activar: el cupón ya está expirado.');
    }

    if (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos) {
      throw new BadRequestException('No se puede activar: el cupón alcanzó su límite de usos.');
    }
  }

  const cuponActualizado = await this.prisma.cupones.update({
    where: { id: BigInt(id) },
    data: { activo: nuevoEstado },
  });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: nuevoEstado ? 'CUPON_ACTIVADO' : 'CUPON_DESACTIVADO',
        detalle: `Cupón ${id} ${nuevoEstado ? 'activado' : 'desactivado'}`,
      },
    });

    return cuponActualizado;
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

  async remove(id: number, auditorId: number) {
    const cupon = await this.findOne(id);
    
    // Validar si tiene pagos asociados
    const pagos = await this.prisma.pagos.findFirst({
      where: { id_cupon: BigInt(id) }
    });

    if (pagos) {
      throw new ConflictException('No se puede eliminar el cupón porque tiene historial de pagos asociados.');
    }

    await this.prisma.cupones.delete({
      where: { id: BigInt(id) }
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'CUPON_ELIMINADO',
        detalle: `Cupón ${id} eliminado físicamente`,
      },
    });

    return { message: `Cupón con ID ${id} eliminado correctamente.` };
  }

  private validateFutureDate(fecha: Date | string) {
  const fechaExpiracion = new Date(fecha);
  const ahora = new Date();
  
  if (fechaExpiracion <= ahora) {
    throw new BadRequestException('La fecha de expiración debe ser una fecha futura.');
  }
  return fechaExpiracion;
}
}
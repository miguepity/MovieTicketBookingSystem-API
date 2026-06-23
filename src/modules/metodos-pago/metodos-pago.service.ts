import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AesGcmService } from '../../common/crypto/aes-gcm.service';
import { MetodoPago } from '../../common/enums/metodo-pago.enum';
import { MarcaTarjeta } from '../../common/enums/marca-tarjeta.enum';
import { CrearMetodoPagoDto } from './dto/crear-metodo-pago.dto';
import { MetodoPagoResponseDto } from './dto/metodo-pago-response.dto';

type MetodoRow = {
  id: bigint;
  tipo: string;
  marca: string | null;
  ultimos4: string | null;
  expiracion: string | null;
  titular: string | null;
  predeterminado: boolean;
  created_at: Date;
};

function toResponse(m: MetodoRow): MetodoPagoResponseDto {
  return {
    id: m.id.toString(),
    tipo: m.tipo as MetodoPago,
    marca: m.marca as MarcaTarjeta | null,
    ultimos4: m.ultimos4,
    expiracion: m.expiracion,
    titular: m.titular,
    predeterminado: m.predeterminado,
    created_at: m.created_at.toISOString(),
  };
}

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
  );
}

@Injectable()
export class MetodosPagoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aes: AesGcmService,
  ) {}

  async list(userId: bigint): Promise<MetodoPagoResponseDto[]> {
    const rows = await this.prisma.metodosPago.findMany({
      where: { id_usuario: userId },
      orderBy: [{ predeterminado: 'desc' }, { created_at: 'desc' }],
    });
    return rows.map(toResponse);
  }

  async create(
    userId: bigint,
    dto: CrearMetodoPagoDto,
  ): Promise<MetodoPagoResponseDto> {
    if (dto.tipo === MetodoPago.EFECTIVO) {
      try {
        const m = await this.prisma.metodosPago.create({
          data: { id_usuario: userId, tipo: MetodoPago.EFECTIVO },
        });
        return toResponse(m);
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new ConflictException('Ya tenés efectivo como método guardado');
        }
        throw e;
      }
    }

    // tarjeta — DTO validation guarantees these fields exist
    const numero = dto.numero!;
    const ultimos4 = numero.slice(-4);
    const pan_cifrado = this.aes.encrypt(numero);

    const m = await this.prisma.metodosPago.create({
      data: {
        id_usuario: userId,
        tipo: MetodoPago.TARJETA,
        marca: dto.marca!,
        ultimos4,
        expiracion: dto.expiracion!,
        titular: dto.titular!,
        pan_cifrado,
      },
    });
    return toResponse(m);
  }

  async remove(userId: bigint, id: bigint): Promise<void> {
    const r = await this.prisma.metodosPago.deleteMany({
      where: { id, id_usuario: userId },
    });
    if (r.count === 0) {
      throw new NotFoundException();
    }
  }

  async setDefault(userId: bigint, id: bigint): Promise<MetodoPagoResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.metodosPago.findFirst({
        where: { id, id_usuario: userId },
      });
      if (!target) {
        throw new NotFoundException();
      }
      await tx.metodosPago.updateMany({
        where: { id_usuario: userId, predeterminado: true },
        data: { predeterminado: false },
      });
      const m = await tx.metodosPago.update({
        where: { id },
        data: { predeterminado: true },
      });
      return toResponse(m);
    });
  }
}

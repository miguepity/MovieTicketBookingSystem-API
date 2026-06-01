import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const defaultRole = await this.prisma.roles.findFirst({
      where: { nombre: 'usuario' },
    });
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not configured');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.usuarios.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        password_hash: passwordHash,
        telefono: dto.telefono,
        id_rol: defaultRole.id,
        estado: 'activo',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        estado: true,
        created_at: true,
        roles: { select: { nombre: true } },
      },
    });

    return user;
  }
}

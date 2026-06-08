import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

    return {
      ...user,
      id: user.id.toString(), // Prevención de error BigInt al serializar en registro
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.estado !== 'activo') {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.roles.nombre,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id.toString(),
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.roles.nombre,
      },
    };
  }

  // El logout se manejara completamente en el frontend eliminando el token JWT
  logout() {
    return {
      success: true,
      message:
        'Sesión cerrada correctamente en el servidor. Por favor destruya el token en el cliente.',
    };
  }
}

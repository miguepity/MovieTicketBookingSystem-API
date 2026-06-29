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
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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
        estado: 'pendiente',
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

    const confirmationToken = await this.jwtService.signAsync(
      { sub: user.id.toString(), email: user.email },
      { expiresIn: '24h' },
    );

    // Enviar el correo usando el nuevo servicio
    await this.emailService.sendActivationCode(user.email, confirmationToken);

    return {
      user: {
        ...user,
        id: user.id.toString(),
      },
      confirmation_token: confirmationToken,
      message:
        'Usuario registrado. Por favor confirme su cuenta usando el token enviado.',
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

  async resendActivation(email: string) {
    const user = await this.prisma.usuarios.findUnique({ where: { email } });
    if (!user || user.estado === 'activo') {
      return { message: 'Si la cuenta existe y está pendiente, se reenvió el correo.' };
    }

    const confirmationToken = await this.jwtService.signAsync(
      { sub: user.id.toString(), email: user.email },
      { expiresIn: '24h' },
    );

    await this.emailService.sendActivationCode(user.email, confirmationToken);
    return { message: 'Si la cuenta existe y está pendiente, se reenvió el correo.' };
  }

  async activate(dto: { token: string }) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);
      const user = await this.prisma.usuarios.update({
        where: { email: payload.email },
        data: { estado: 'activo' },
      });
      return { message: 'Cuenta activada correctamente' };
    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
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

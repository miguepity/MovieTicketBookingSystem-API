import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}
  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password_hash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: usuario.email, sub: usuario.id.toString() };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        id_rol: usuario.id_rol.toString(),
        estado: usuario.estado,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existente = await this.prisma.usuarios.findUnique({
      where: { email: registerDto.email },
    });

    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }

    const rolDefault =
      (await this.prisma.roles.findFirst({
        where: { nombre: 'cliente' },
      })) ?? (await this.prisma.roles.findFirst());

    if (!rolDefault) {
      throw new InternalServerErrorException(
        'No hay roles configurados en la base de datos. Ejecuta el seed primero.',
      );
    }

    const password_hash = await bcrypt.hash(registerDto.password, 10);

    const usuario = await this.prisma.usuarios.create({
      data: {
        nombre: registerDto.nombre,
        email: registerDto.email,
        password_hash,
        telefono: registerDto.telefono,
        id_rol: rolDefault.id,
        estado: 'activo',
      },
    });

    const payload = { email: usuario.email, sub: usuario.id.toString() };

    await this.mailService.sendEmail({
      to: { email: usuario.email, name: usuario.nombre },
      subject: '¡Bienvenido a Movie Ticket Booking!',
      htmlContent: `
        <h2>¡Hola, ${usuario.nombre}!</h2>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p>Ya puedes iniciar sesión y comenzar a reservar tus entradas de cine.</p>
        <br/>
        <p>— El equipo de Movie Ticket Booking</p>
      `,
    });

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        id_rol: usuario.id_rol.toString(),
        estado: usuario.estado,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
    });

    // Respuesta genérica siempre para evitar enumeración de emails
    const respuestaGenerica = {
      message:
        'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
    };

    if (!usuario) {
      return respuestaGenerica;
    }

    // Invalidar tokens anteriores no usados del mismo usuario
    await this.prisma.passwordResetToken.updateMany({
      where: { id_usuario: usuario.id, usado: false },
      data: { usado: true },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.passwordResetToken.create({
      data: {
        id_usuario: usuario.id,
        token,
        expires_at: expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.mailService.sendEmail({
      to: { email: usuario.email, name: usuario.nombre },
      subject: 'Restablece tu contraseña - Movie Ticket Booking',
      htmlContent: `
        <h2>¡Hola, ${usuario.nombre}!</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p>
          <a href="${resetLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #e50914;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          ">Restablecer contraseña</a>
        </p>
        <p>Este enlace expirará en <strong>1 hora</strong>.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.</p>
        <br/>
        <p>— El equipo de Movie Ticket Booking</p>
      `,
    });

    return respuestaGenerica;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!resetToken || resetToken.usado) {
      throw new BadRequestException('El token no es válido o ya fue utilizado');
    }

    if (resetToken.expires_at < new Date()) {
      throw new BadRequestException('El token ha expirado');
    }

    const password_hash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.usuarios.update({
        where: { id: resetToken.id_usuario },
        data: { password_hash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usado: true },
      }),
    ]);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const emailEnUso = await this.prisma.usuarios.findUnique({
      where: { email: dto.newEmail },
    });

    if (emailEnUso) {
      throw new ConflictException('El email ya está en uso');
    }

    const usuario = await this.prisma.usuarios.update({
      where: { id: BigInt(userId) },
      data: { email: dto.newEmail },
    });

    const payload = { email: usuario.email, sub: usuario.id.toString() };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        id_rol: usuario.id_rol.toString(),
        estado: usuario.estado,
      },
    };
  }
}

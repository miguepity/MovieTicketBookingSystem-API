import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { password, ...rest } = signupDto;
    const SALT_ROUNDS = 10;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.usersService.create({
      ...rest,
      password_hash,
    });

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.nombre,
      role: user.id_rol.toString(),
    };

    // Enviar correo de bienvenida (sin esperar para no bloquear la respuesta)
    void this.mailService.sendEmail(
      user.email,
      '¡Bienvenido a MovieSys!',
      `<h1>Hola ${user.nombre}</h1><p>Gracias por registrarte en MovieSys. ¡Disfruta de las mejores películas!</p>`,
    );

    return {
      message: 'Usuario registrado exitosamente',
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new BadRequestException('Invalid credentials');

    const hashed_password = await bcrypt.compare(password, user.password_hash);

    if (!user || !hashed_password) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.nombre,
      role: user.id_rol.toString(),
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );

    // Por seguridad, si el usuario no existe, respondemos con éxito igual
    if (!user) return;

    // Generar token seguro
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Hashear para guardar en DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar token
    await this.prisma.passwordResetToken.create({
      data: {
        id_usuario: user.id,
        token: hashedToken,
        expires_at: expiresAt,
      },
    });

    // Enviar correo
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    void this.mailService.sendEmail(
      user.email,
      'Recuperación de contraseña - MovieSys',
      `<h1>Hola ${user.nombre}</h1>
       <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace (expira en 15 minutos):</p>
       <a href="${resetUrl}">${resetUrl}</a>`,
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Hashear token recibido para comparar
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar token válido
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        usado: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hashear nueva contraseña
    const SALT_ROUNDS = 10;
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar usuario e invalidar token en una transacción
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
  }
}

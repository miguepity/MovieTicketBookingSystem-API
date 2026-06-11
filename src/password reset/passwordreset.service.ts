import { PrismaService } from '../prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return {
        message:
          'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.',
      };
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    await this.prisma.passwordResetToken.create({
      data: {
        id_usuario: user.id,
        token: token,
        expires_at: expiresAt,
      },
    });

    // TODO: Integrar con EmailService para enviar el token
    console.log(`Token de recuperación para ${dto.email}: ${token}`);

    return {
      message:
        'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const foundToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: dto.token,
        usado: false,
        expires_at: { gt: new Date() },
      },
      include: { usuarios: true },
    });

    if (!foundToken) {
      throw new BadRequestException('El token es inválido o ha expirado.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.usuarios.update({
        where: { id: foundToken.id_usuario },
        data: { password_hash: passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: foundToken.id },
        data: { usado: true },
      }),
    ]);

    return { message: 'Contraseña actualizada con éxito.' };
  }
}

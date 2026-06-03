import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './register.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly successMessage =
    'Si el correo existe, se enviaran instrucciones para restablecer la contrasena';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private serializeUser(user: any) {
    return {
      ...user,
      id: user.id ? Number(user.id) : undefined,
      id_rol: user.id_rol ? Number(user.id_rol) : undefined,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }
    const isPasswordValid = await this.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    void password_hash;

    return {
      ...userWithoutPassword,
      id: Number(userWithoutPassword.id),
      id_rol: Number(userWithoutPassword.id_rol),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.usuarios.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya esta registrado');
    }
    const hashedPassword = await this.hashPassword(registerDto.password);
    const newUser = await this.prisma.usuarios.create({
     data: {
        nombre: registerDto.name,
        email: registerDto.email,
        password_hash: hashedPassword,
        telefono: registerDto.phone,
        estado: 'ACTIVO',
        notificaciones_activas: false,
        roles: {
          connect: { id: BigInt(registerDto.roleId) }
        }
      },
    });

    const { password_hash: _, ...userWithoutPassword } = newUser;

    const payload = {
      id: Number(newUser.id),
      email: newUser.email,
      roleId: Number(newUser.id_rol),
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.serializeUser(userWithoutPassword),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password_hash);

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.id_rol,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = this.normalizeEmail(forgotPasswordDto.email);

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('El email es requerido y debe ser valido');
    }

    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return { message: this.successMessage };
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        id_usuario: user.id,
        usado: false,
      },
      data: { usado: true },
    });

    const token = this.generateToken(email);
    const tokenHash = await bcrypt.hash(token, 10);

    await this.prisma.passwordResetToken.create({
      data: {
        id_usuario: user.id,
        token: tokenHash,
        expires_at: this.getExpirationDate(),
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: this.successMessage };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const token = this.normalizeResetToken(resetPasswordDto.token);
    const newPassword = resetPasswordDto.newPassword?.trim() ?? '';

    if (!token) {
      throw new BadRequestException('El token es requerido');
    }

    if (!this.isValidPassword(newPassword)) {
      throw new BadRequestException(
        'La nueva contrasena debe tener al menos 8 caracteres',
      );
    }

    const validTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usado: false,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        id_usuario: true,
        token: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const passwordResetToken = await this.findMatchingResetToken(
      token,
      validTokens,
    );

    if (!passwordResetToken) {
      throw new BadRequestException('Token invalido o expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.usuarios.update({
        where: { id: passwordResetToken.id_usuario },
        data: { password_hash: passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: passwordResetToken.id },
        data: { usado: true },
      }),
    ]);

    return { message: 'Contrasena restablecida correctamente' };
  }

  private normalizeEmail(email?: string) {
    return email?.trim().toLowerCase() ?? '';
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPassword(password: string) {
    return password.length >= 8;
  }

  private normalizeResetToken(token?: string) {
    const trimmedToken = token?.trim() ?? '';

    try {
      return decodeURIComponent(trimmedToken);
    } catch {
      return trimmedToken;
    }
  }

  private async findMatchingResetToken(
    token: string,
    resetTokens: Array<{ id: bigint; id_usuario: bigint; token: string }>,
  ) {
    for (const resetToken of resetTokens) {
      const isMatch = await bcrypt.compare(token, resetToken.token);

      if (isMatch) {
        return resetToken;
      }
    }

    return null;
  }

  private generateToken(email: string) {
    const timestamp = Date.now().toString(36);
    const firstPart = Math.random().toString(36).slice(2);
    const secondPart = Math.random().toString(36).slice(2);

    return `${email}.${timestamp}.${firstPart}.${secondPart}`;
  }

  private getExpirationDate() {
    const ttlMinutes = Number(
      process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 15,
    );

    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from 'src/mail/mail.service';
import { ChangeEmailDto } from './dto/change-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

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

    const rolDefault = await this.prisma.roles.findFirst({
      where: { nombre: 'cliente' },
    }) ?? await this.prisma.roles.findFirst();

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

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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

    const password_hash = await bcrypt.hash(registerDto.password, 10);

    const usuario = await this.prisma.usuarios.create({
      data: {
        nombre: registerDto.nombre,
        email: registerDto.email,
        password_hash,
        telefono: registerDto.telefono,
        id_rol: 1n,
        estado: 'activo',
      },
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

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
    const { password_hash: _, ...userWithoutPassword } = user;
    return this.serializeUser(userWithoutPassword);
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
}
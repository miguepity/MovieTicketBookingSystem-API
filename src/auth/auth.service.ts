import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }
    const isPasswordValid = await this.comparePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return null;
    }
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.id_rol,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { id: number; email: string; roleId: number }) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(payload.id) },
      include: {
        roles: true, 
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    if (user.estado !== 'ACTIVO') {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      id: Number(userWithoutPassword.id),
      nombre: userWithoutPassword.nombre,
      email: userWithoutPassword.email,
      id_rol: Number(userWithoutPassword.id_rol),
      role: user.roles.nombre, 
    };
  }
}
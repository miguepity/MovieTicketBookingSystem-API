import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const authorizationHeader = request.headers['authorization'] || request.headers['Authorization'];
    
    if (!authorizationHeader) {
      throw new UnauthorizedException('Token no proporcionado en las cabeceras.');
    }

    const [type, token] = authorizationHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('El formato del token debe ser Bearer <token>.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      
      const usuarioDb = await this.prisma.usuarios.findUnique({
        where: { id: BigInt(payload.id) },
        include: {
          roles: true, 
        },
      });

      if (!usuarioDb) {
        throw new UnauthorizedException('Usuario no encontrado en el sistema.');
      }

      request.user = {
        id: Number(usuarioDb.id),
        email: usuarioDb.email,
        id_rol: Number(usuarioDb.id_rol),
        roleId: Number(usuarioDb.id_rol),
        role: usuarioDb.roles?.nombre, 
      };
      
    } catch (error) {
      throw new UnauthorizedException('Token inválido, alterado o expirado.');
    }

    return true;
  }
}
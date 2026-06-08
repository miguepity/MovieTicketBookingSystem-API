import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const authorizationHeader = request.headers['authorization'];
    
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

      request.user = payload;
      
    } catch (error) {
      throw new UnauthorizedException('Token inválido, alterado o expirado.');
    }

    return true;
  }
}
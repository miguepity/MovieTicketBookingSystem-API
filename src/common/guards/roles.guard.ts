import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{
      user?: { rol?: string };
    }>();

    if (!user?.rol || !required.includes(user.rol)) {
      throw new ForbiddenException({
        code: 'ROL_NO_AUTORIZADO',
        message: `Rol requerido: ${required.join(', ')}`,
      });
    }

    return true;
  }
}

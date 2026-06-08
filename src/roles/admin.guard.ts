import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se asume que el AuthGuard ya se ejecutó y pobló request.user
    // El payload del JWT contiene el campo 'role' (id_rol)
    if (!user || Number(user.role) !== 1) {
      throw new ForbiddenException(
        'Acceso denegado: Se requieren privilegios de administrador',
      );
    }

    return true;
  }
}

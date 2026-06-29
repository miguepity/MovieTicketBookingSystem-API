import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class IsRecepcionistaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar si el usuario tiene el rol de recepcionista (role = 3) o administrador (role = 1)
    console.log('Usuario autenticado:', user);
    if (!user || (Number(user.role) !== 3 && Number(user.role) !== 1)) {
      throw new ForbiddenException(
        'Acceso denegado: Se requieren privilegios de recepcionista',
      );
    }
    return true;
  }
}

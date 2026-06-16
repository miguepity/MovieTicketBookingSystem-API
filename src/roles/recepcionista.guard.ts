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

    if (!user || Number(user.role) !== 3) {
      throw new ForbiddenException(
        'Acceso denegado: Se requieren privilegios de recepcionista',
      );
    }
    return true;
  }
}

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Suppress errors so unauthenticated requests pass through with user = null
  handleRequest(_err: any, user: any): any {
    return user || null;
  }

  canActivate(context: ExecutionContext): any {
    // Call parent but swallow exceptions — missing/invalid token => user stays null
    return super.canActivate(context);
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AUDITABLE_KEY, AuditableOptions } from '../decorators/auditable.decorator';

/**
 * Global interceptor that writes a row to `audit_log` whenever a handler
 * is decorated with @Auditable({ entidad, accion }).
 *
 * Schema notes (actual AuditLog Prisma model):
 *  - id_auditor  BigInt  (required) — the authenticated user performing the action
 *  - id_usuario  BigInt  (required) — set to id_auditor (admin acting as subject);
 *                                     future tasks may override via AuditableOptions
 *  - entidad_id  BigInt? — extracted from res.id or req.params.id (cast to BigInt)
 *  - valor_anterior / valor_nuevo are Json? — stored as plain objects, not strings
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService, private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const opts = this.reflector.get<AuditableOptions>(AUDITABLE_KEY, context.getHandler());
    if (!opts) return next.handle();

    const req = context.switchToHttp().getRequest();
    const bodyBefore = req.body;

    return next.handle().pipe(
      tap((res) => {
        const rawId = opts.entidadId
          ? opts.entidadId({ req, res })
          : (res?.id ?? req.params?.id);

        const entidadId = rawId != null ? BigInt(rawId) : null;
        const rawUserId = req.user?.userId ?? null;
        const idAuditor: bigint | null = rawUserId != null ? BigInt(rawUserId) : null;

        void this.prisma.auditLog.create({
          data: {
            id_auditor: idAuditor as bigint,
            id_usuario: idAuditor as bigint,
            accion: opts.accion,
            entidad: opts.entidad,
            entidad_id: entidadId,
            valor_anterior: bodyBefore && Object.keys(bodyBefore).length
              ? (bodyBefore as object)
              : Prisma.JsonNull,
            valor_nuevo: res && typeof res === 'object' ? (res as object) : Prisma.JsonNull,
          },
        }).catch((e) => console.error('Audit log failed', e));
      }),
    );
  }
}

import { SetMetadata } from '@nestjs/common';

export type AccionAuditable = 'crear' | 'actualizar' | 'eliminar' | 'accion';

export interface AuditableOptions {
  entidad: string;
  accion: AccionAuditable;
  /** Optional fn that extracts entidad_id from req or response. Defaults to res?.id ?? req.params.id */
  entidadId?: (ctx: { req: any; res: any }) => string | number | bigint | undefined;
}

export const AUDITABLE_KEY = 'auditable';
export const Auditable = (opts: AuditableOptions) => SetMetadata(AUDITABLE_KEY, opts);

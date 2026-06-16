export class AuditLogDetailAuditorDto {
  id!: string;
  nombre!: string;
  email!: string;
}

export class AuditLogDetailResponseDto {
  id!: string;
  created_at!: string;
  accion!: string;
  detalle!: string | null;
  entidad!: string | null;
  entidad_id!: string | null;
  auditor!: AuditLogDetailAuditorDto;
  valor_anterior!: object | null;
  valor_nuevo!: object | null;
}

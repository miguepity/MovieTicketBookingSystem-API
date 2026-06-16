export class AuditLogItemAuditorDto {
  id!: string;
  nombre!: string;
  email!: string;
}

export class AuditLogItemResponseDto {
  id!: string;
  created_at!: string;
  accion!: string;
  detalle!: string | null;
  entidad!: string | null;
  entidad_id!: string | null;
  auditor!: AuditLogItemAuditorDto;
  tiene_snapshot!: boolean;
}

export class AuditLogListResponseDto {
  items!: AuditLogItemResponseDto[];
  total!: number;
  page!: number;
  page_size!: number;
}

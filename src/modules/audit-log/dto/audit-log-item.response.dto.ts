import { ApiProperty } from '@nestjs/swagger';

export class AuditLogItemAuditorDto {
  @ApiProperty({
    description: 'ID del auditor',
    type: String,
    example: '123',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del auditor',
    type: String,
    example: 'Juan Pérez',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Email del auditor',
    type: String,
    example: 'juan@example.com',
  })
  email!: string;
}

export class AuditLogItemResponseDto {
  @ApiProperty({
    description: 'ID único del registro de auditoría',
    type: String,
    example: '789',
  })
  id!: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del registro',
    type: String,
    format: 'date-time',
    example: '2026-06-25T10:30:00Z',
  })
  created_at!: string;

  @ApiProperty({
    description: 'Acción realizada (CREATE, UPDATE, DELETE, etc.)',
    type: String,
    example: 'UPDATE',
  })
  accion!: string;

  @ApiProperty({
    description: 'Detalle adicional de la acción',
    type: String,
    nullable: true,
    example: 'Actualización de precio',
  })
  detalle!: string | null;

  @ApiProperty({
    description: 'Nombre de la entidad afectada',
    type: String,
    nullable: true,
    example: 'Pelicula',
  })
  entidad!: string | null;

  @ApiProperty({
    description: 'ID de la entidad afectada',
    type: String,
    nullable: true,
    example: '456',
  })
  entidad_id!: string | null;

  @ApiProperty({
    description: 'Información del usuario que realizó la acción',
    type: AuditLogItemAuditorDto,
  })
  auditor!: AuditLogItemAuditorDto;

  @ApiProperty({
    description: 'Indica si hay snapshot guardado para este registro',
    type: Boolean,
    example: true,
  })
  tiene_snapshot!: boolean;
}

export class AuditLogListResponseDto {
  @ApiProperty({
    description: 'Lista de registros de auditoría',
    type: () => AuditLogItemResponseDto,
    isArray: true,
  })
  items!: AuditLogItemResponseDto[];

  @ApiProperty({
    description: 'Total de registros disponibles',
    type: Number,
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Número de página actual',
    type: Number,
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Cantidad de registros por página',
    type: Number,
    example: 20,
  })
  page_size!: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDetailAuditorDto {
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

export class AuditLogDetailResponseDto {
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
    type: AuditLogDetailAuditorDto,
  })
  auditor!: AuditLogDetailAuditorDto;

  @ApiProperty({
    description: 'Snapshot con los valores anteriores de los campos modificados',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: { precio: 100.00, titulo: 'Película Original' },
  })
  valor_anterior!: object | null;

  @ApiProperty({
    description: 'Snapshot con los nuevos valores de los campos modificados',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: { precio: 120.00, titulo: 'Película Actualizada' },
  })
  valor_nuevo!: object | null;
}

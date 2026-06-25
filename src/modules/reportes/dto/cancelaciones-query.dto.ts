import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class CancelacionesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar cancelaciones desde esta fecha (ISO 8601)',
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar cancelaciones hasta esta fecha (ISO 8601)',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cine',
    type: String,
    example: '1',
  })
  @IsOptional()
  @IsNumberString()
  id_cine?: string;
}

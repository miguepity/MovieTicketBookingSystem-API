import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class CancelacionesQueryDto {
  @ApiProperty({
    description: 'Filtrar cancelaciones desde esta fecha (ISO 8601)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiProperty({
    description: 'Filtrar cancelaciones hasta esta fecha (ISO 8601)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiProperty({
    description: 'Filtrar por ID de cine',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id_cine?: string;
}

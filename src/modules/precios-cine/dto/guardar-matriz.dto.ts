import { IsArray, IsObject, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CineMatrizItemDto {
  @ApiPropertyOptional({
    type: String,
    description: 'ID del cine (BigInt como string)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  id_cine?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Alias para id_cine (aceptado en round-trip desde GET)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Nombre del cine (solo lectura, aceptado pero ignorado en escritura)',
    example: 'Cine Center',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Ciudad del cine (solo lectura, aceptado pero ignorado en escritura)',
    example: 'San José',
  })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({
    type: 'object',
    description: 'Mapa de ID tipo_asiento a precio (número o null)',
    example: { '1': 100.00, '2': 150.50, '3': null },
    additionalProperties: true,
  })
  @IsObject()
  precios!: Record<string, number | null>;
}

export class GuardarMatrizDto {
  @ApiPropertyOptional({
    type: 'object',
    description: 'Precios por defecto para todos los cines (map tipo_asiento -> precio)',
    example: { '1': 100.00, '2': 150.50 },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  defaults?: Record<string, number | null>;

  @ApiPropertyOptional({
    type: () => CineMatrizItemDto,
    isArray: true,
    description: 'Array de cines con sus precios por tipo de asiento',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CineMatrizItemDto)
  cines?: CineMatrizItemDto[];

  @ApiPropertyOptional({
    type: 'array',
    description: 'Tipos de asiento (solo lectura, aceptado pero ignorado en escritura)',
    example: [{ id: '1', nombre: 'VIP' }, { id: '2', nombre: 'Regular' }],
  })
  @IsOptional()
  @IsArray()
  tipos_asiento?: any[];
}

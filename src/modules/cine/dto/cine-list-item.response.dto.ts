import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SalaListItemResponseDto } from './sala-list-item.response.dto';

export class CineListItemResponseDto {
  @ApiProperty({
    description: 'ID del cine',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del cine',
    example: 'Cinépolis Plaza Mayor',
    maxLength: 150,
  })
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Dirección física del cine',
    example: 'Av. Principal 123, Ciudad de México',
    nullable: true,
  })
  direccion!: string | null;

  @ApiProperty({
    description: 'ID de la ciudad',
    type: String,
    example: '1',
  })
  id_ciudad!: string;

  @ApiProperty({
    description: 'Si el cine está activo',
    example: true,
  })
  activo!: boolean;

  @ApiProperty({
    description: 'Salas del cine',
    type: () => SalaListItemResponseDto,
    isArray: true,
  })
  @Type(() => SalaListItemResponseDto)
  salas!: SalaListItemResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación del cine',
    type: String,
    format: 'date-time',
    example: '2026-01-15T10:30:00.000Z',
  })
  fecha_creacion!: Date;
}

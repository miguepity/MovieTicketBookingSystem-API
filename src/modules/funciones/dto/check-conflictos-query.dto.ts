import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  Min,
} from 'class-validator';

export class CheckConflictosQueryDto {
  @ApiProperty({
    description: 'ID del cine',
    type: String,
    example: '1',
  })
  @IsNumberString()
  id_cine!: string;

  @ApiProperty({
    description: 'ID de la sala',
    type: String,
    example: '1',
  })
  @IsNumberString()
  id_sala!: string;

  @ApiProperty({
    description: 'Fecha y hora de la función a verificar',
    type: String,
    format: 'date-time',
    example: '2026-12-31T20:30:00.000Z',
  })
  @IsDateString()
  fecha_hora!: string;

  @ApiProperty({
    description: 'Duración de la película en minutos',
    type: Number,
    minimum: 1,
    example: 120,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duracion_min!: number;

  @ApiPropertyOptional({
    description: 'ID de la función a ignorar en la búsqueda de conflictos',
    type: String,
    example: '5',
  })
  @IsOptional()
  @IsNumberString()
  ignorar_id?: string;
}

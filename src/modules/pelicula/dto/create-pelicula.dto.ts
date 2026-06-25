import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePeliculaDto {
  @ApiProperty({
    description: 'Título de la película',
    type: String,
    example: 'Inception',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiPropertyOptional({
    description: 'Sinopsis de la película',
    type: String,
    example: 'Un ladrón roba secretos a través de los sueños.',
  })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({
    description: 'URL del póster de la película',
    type: String,
    format: 'uri',
    example: 'https://example.com/poster.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  poster_url?: string;

  @ApiPropertyOptional({
    description: 'ID del idioma',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  id_idioma?: bigint;

  @ApiPropertyOptional({
    description: 'ID del género',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  id_genero?: bigint;

  @ApiPropertyOptional({
    description: 'Fecha de estreno de la película',
    type: String,
    format: 'date-time',
    example: '2023-07-16T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_estreno?: string;

  @ApiPropertyOptional({
    description: 'Indica si la película está activa',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Duración de la película en minutos',
    type: Number,
    example: 120,
    minimum: 1,
    maximum: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(600)
  duracion_min?: number;

  @ApiPropertyOptional({
    description: 'Frase corta o eslogan de la película',
    type: String,
    example: 'Tu mente es la escena del crimen.',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Ficha técnica como JSON (dirección, guion, reparto, fotografía, etc.)',
    type: 'object',
    additionalProperties: true,
    example: { direccion: 'Christopher Nolan', reparto: ['Leo'] },
  })
  @IsOptional()
  @IsObject()
  ficha_tecnica?: Record<string, unknown>;
}

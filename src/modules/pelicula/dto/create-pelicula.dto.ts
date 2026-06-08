import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePeliculaDto {
  @ApiProperty({
    description: 'Título de la película',
    example: 'Inception',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiPropertyOptional({
    description: 'Sinopsis de la película',
    example: 'Un ladrón roba secretos a través de los sueños.',
  })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({
    description: 'URL del póster de la película',
    example: 'https://example.com/poster.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  poster_url?: string;

  @ApiPropertyOptional({ description: 'ID del idioma', example: '1' })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  id_idioma?: bigint;

  @ApiPropertyOptional({ description: 'ID del género', example: '1' })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  id_genero?: bigint;

  @ApiPropertyOptional({
    description: 'Fecha de estreno (YYYY-MM-DD)',
    example: '2023-07-16',
  })
  @IsOptional()
  @IsDateString()
  fecha_estreno?: string;

  @ApiPropertyOptional({
    description: 'Indica si la película está activa',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

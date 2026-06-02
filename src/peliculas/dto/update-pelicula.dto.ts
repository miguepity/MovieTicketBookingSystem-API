import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePeliculaDto {
  @ApiPropertyOptional({ description: 'Título de la película' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Sinopsis de la película' })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({ description: 'URL del poster' })
  @IsOptional()
  @IsString()
  poster_url?: string;

  @ApiPropertyOptional({ description: 'Fecha de estreno' })
  @IsOptional()
  @IsDateString()
  fecha_estreno?: string;

  @ApiPropertyOptional({ description: 'ID del idioma' })
  @IsOptional()
  @IsNumber()
  id_idioma?: number;

  @ApiPropertyOptional({ description: 'ID del género' })
  @IsOptional()
  @IsNumber()
  id_genero?: number;

  @ApiPropertyOptional({ description: 'Si la película está activa' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

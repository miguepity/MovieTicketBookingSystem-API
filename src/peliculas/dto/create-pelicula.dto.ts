import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePeliculaDto {
  @ApiProperty({ example: 'El Último Horizonte', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  titulo!: string;

  @ApiPropertyOptional({ example: 'Un viaje épico al fin del mundo...' })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({
    example: '/uploads/posters/pelicula.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  poster_url?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  id_idioma?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  id_genero?: number;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsOptional()
  @IsDateString()
  fecha_estreno?: Date;

  @ApiPropertyOptional({ example: '2h 15m' })
  @IsOptional()
  @IsString()
  dur?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  id_usuario!: number;
}

import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscarPeliculaDto {
  @ApiPropertyOptional({ example: 'El Padrino', description: 'Búsqueda parcial por título (insensible a mayúsculas)' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ example: '1', description: 'ID del género para filtrar' })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiPropertyOptional({ example: '1', description: 'ID del idioma para filtrar' })
  @IsOptional()
  @IsString()
  idioma?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de estreno desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Fecha de estreno hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({ example: '1', description: 'ID de la ciudad — filtra películas con funciones activas en esa ciudad' })
  @IsOptional()
  @IsString()
  ciudad_id?: string;
}

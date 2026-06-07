import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePeliculaDto {
  @ApiPropertyOptional({ example: 'El Padrino II', description: 'Nuevo título de la película' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ example: 'Continuación de la saga Corleone.', description: 'Nueva sinopsis' })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({ example: 'https://example.com/nuevo-poster.jpg', description: 'Nueva URL del poster' })
  @IsOptional()
  @IsUrl({}, { message: 'El poster_url debe ser una URL válida' })
  poster_url?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del nuevo idioma' })
  @IsOptional()
  @IsInt()
  id_idioma?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID del nuevo género' })
  @IsOptional()
  @IsInt()
  id_genero?: number;

  @ApiPropertyOptional({ example: '1974-12-18', description: 'Nueva fecha de estreno en formato YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  fecha_estreno?: string;

  @ApiProperty({ example: 1, description: 'ID del usuario que realiza la edición' })
  @IsInt({ message: 'El id_editor debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_editor es obligatorio' })
  id_editor!: number;
}

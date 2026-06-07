import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePeliculaDto {
  @ApiProperty({ example: 'El Padrino', description: 'Título de la película' })
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo!: string;

  @ApiPropertyOptional({ example: 'Un relato épico de la familia mafiosa Corleone.', description: 'Sinopsis de la película' })
  @IsOptional()
  @IsString()
  sinopsis?: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg', description: 'URL del poster de la película' })
  @IsOptional()
  @IsUrl({}, { message: 'El poster_url debe ser una URL válida' })
  poster_url?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del idioma de la película' })
  @IsOptional()
  @IsInt()
  id_idioma?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID del género de la película' })
  @IsOptional()
  @IsInt()
  id_genero?: number;

  @ApiPropertyOptional({ example: '1972-03-24', description: 'Fecha de estreno en formato YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  fecha_estreno?: string;

  @ApiPropertyOptional({ example: true, description: 'Estado activo de la película (default: true)' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ example: 1, description: 'ID del usuario que registra la película' })
  @IsInt({ message: 'El id_usuario debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  id_usuario!: number;
}

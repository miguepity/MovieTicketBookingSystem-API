import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPeliculaDto {
  @ApiPropertyOptional({ description: 'Título o parte del título a buscar' })
  @IsOptional()
  @IsString()
  titulo?: string;
}

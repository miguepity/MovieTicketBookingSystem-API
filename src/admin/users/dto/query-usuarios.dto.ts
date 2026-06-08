import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUsuariosDto {
  @ApiPropertyOptional({ example: 'juan', description: 'Búsqueda parcial por nombre o email del cliente (insensible a mayúsculas)' })
  @IsOptional()
  @IsString()
  search?: string;
}

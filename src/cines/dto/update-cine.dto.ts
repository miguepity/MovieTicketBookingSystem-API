import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCineDto {
  @ApiPropertyOptional({ description: 'Nombre del cine' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Dirección del cine' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'ID de la ciudad' })
  @IsOptional()
  @IsNumber()
  id_ciudad: number;
}

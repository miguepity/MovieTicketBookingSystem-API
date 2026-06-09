import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCineDto {
  @ApiProperty({ description: 'Nombre del cine' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ description: 'Direccion del cine' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ description: 'ID de la ciudad' })
  id_ciudad: number;
}

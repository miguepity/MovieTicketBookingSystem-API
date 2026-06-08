import { IsOptional, IsString, IsNumber, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger'

export class ReporteReservasQueryDto {

  @ApiProperty({example: 1, description: 'ID de la pelicula'})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_pelicula?: number;

  @ApiProperty({example: 1, description: 'ID del cine'})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cine?: number;

  @ApiProperty({example: '2022-01-01', description: 'Fecha de la reserva'})
  @IsOptional()
  @IsDateString()
  fecha?: string; 

  @ApiProperty({example: 'CONFIRMADA', description: 'Estado de la reserva'})
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiProperty({example: 1, description: 'Página de los resultados'})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({example: 10, description: 'Cantidad de resultados por página'})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ClientesFilterDto {
  @ApiPropertyOptional({ example: 'maría' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'activo', enum: ['activo', 'inactivo', 'bloqueado'] })
  @IsOptional()
  @IsIn(['activo', 'inactivo', 'bloqueado'])
  estado?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ListReportePagosQueryDto {
  @ApiPropertyOptional({ example: '2023-01-01', default: undefined })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ example: 'pendiente', default: undefined })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
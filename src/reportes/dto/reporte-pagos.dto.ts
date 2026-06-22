import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReportePagosDto {
  @ApiPropertyOptional({ description: 'Fecha inicio (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @ApiPropertyOptional({ description: 'Fecha fin (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Estado del pago',
    example: 'completado',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Pagina', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por pagina',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limite?: number = 10;
}

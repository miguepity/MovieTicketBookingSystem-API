import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportePagosQueryDto {
  @ApiProperty({example: '2022-01-01', description: 'Fecha de inicio del reporte'})
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string; 

  @ApiProperty({example: '2022-01-01', description: 'Fecha de fin del reporte'})
  @IsOptional()
  @IsDateString()
  fecha_fin?: string; 

  @ApiProperty({example: 'APROBADO', description: 'Estado del pago'})
  @IsOptional()
  @IsString()
  estado?: string; 
}
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcesarReembolsoDto {
  @ApiPropertyOptional({ description: 'Nota adicional sobre el procesamiento' })
  @IsOptional()
  @IsString()
  nota?: string;
}

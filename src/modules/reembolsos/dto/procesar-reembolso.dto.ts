import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcesarReembolsoDto {
  @ApiPropertyOptional({
    description: 'Nota adicional sobre el procesamiento',
    example: 'Reembolso procesado exitosamente',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}

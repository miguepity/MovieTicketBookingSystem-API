import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReembolsoEfectivoDto {
  @ApiProperty({ description: 'ID del pago a reembolsar' })
  @IsNumber()
  id_pago: number;

  @ApiPropertyOptional({ description: 'Email del recepcionista a notificar' })
  @IsOptional()
  @IsString()
  email_recepcionista?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales del reembolso' })
  @IsOptional()
  @IsString()
  notas?: string;
}

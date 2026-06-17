import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegistrarReembolsoEfectivoDto {
  @ApiProperty({ example: 1, description: 'ID del pago a reembolsar' })
  @IsNotEmpty()
  @IsNumber()
  id_pago: number;

  @ApiProperty({ example: 100, description: 'Monto entregado en efectivo' })
  @IsNotEmpty()
  @IsPositive()
  monto: number;

  @ApiPropertyOptional({
    example: 'Cliente solicito reembolso en taquilla',
    description: 'Nota interna del reembolso',
  })
  @IsOptional()
  @IsString()
  nota?: string;
}

import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalcularReembolsoDto {
  @ApiProperty({
    description: 'ID del pago',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id_pago: number;
}
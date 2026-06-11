import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReembolsoDto {
  @ApiProperty({ description: 'ID del pago a reembolsar' })
  @IsNumber()
  id_pago: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreatePagoEfectivoDto {
  @ApiProperty({ example: 1, description: 'ID de la reserva a confirmar' })
  @IsInt()
  @Min(1)
  id_reserva!: number;
}

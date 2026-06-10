import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReembolsosBodyDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_pago!: number;

  @ApiProperty({ example: '75.00' })
  @IsNotEmpty()
  monto!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Matches } from 'class-validator';

export class CreatePrecioCineDto {
  @ApiProperty({ type: String, example: '1', description: 'ID del cine' })
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  id_cine!: string;

  @ApiProperty({
    type: String,
    example: '1',
    description: 'ID del tipo de asiento',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  id_tipo_asiento!: string;

  @ApiProperty({
    type: String,
    example: '100.00',
    description: 'Precio con hasta 2 decimales',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'precio debe ser un número con hasta 2 decimales',
  })
  precio!: string;
}

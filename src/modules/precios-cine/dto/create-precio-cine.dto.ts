import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Matches } from 'class-validator';

export class CreatePrecioCineDto {
  @ApiProperty({
    type: String,
    example: '1',
    description: 'ID del cine (BigInt como string)',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  id_cine!: string;

  @ApiProperty({
    type: String,
    example: '1',
    description: 'ID del tipo de asiento (BigInt como string)',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  id_tipo_asiento!: string;

  @ApiProperty({
    type: String,
    example: '100.00',
    description: 'Precio con hasta 2 decimales (formato: números.decimales)',
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'precio debe ser un número con hasta 2 decimales',
  })
  precio!: string;
}

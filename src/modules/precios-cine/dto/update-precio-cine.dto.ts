import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePrecioCineDto {
  @ApiProperty({
    type: String,
    example: '120.00',
    description: 'Nuevo precio con hasta 2 decimales',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'precio debe ser un número con hasta 2 decimales',
  })
  precio!: string;
}

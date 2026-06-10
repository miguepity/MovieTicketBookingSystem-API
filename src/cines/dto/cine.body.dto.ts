import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCineDto {
  @ApiProperty({ example: 'MovieTicket Tegucigalpa' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: 'Blvd. Morazán, Tegucigalpa', required: false })
  @IsString()
  direccion!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_ciudad!: number;
}

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCiudadeDto {
  @ApiProperty({ example: 'Tegucigalpa' })
  @IsString()
  nombre!: string;
}

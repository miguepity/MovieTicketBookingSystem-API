import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoAsientoDto {
  @ApiProperty({
    description: 'Nombre único del tipo de asiento',
    example: 'preferencial',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre!: string;
}

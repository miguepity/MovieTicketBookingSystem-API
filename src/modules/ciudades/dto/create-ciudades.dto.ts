import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCiudadesDto {
  @ApiProperty({
    description: 'Nombre único de la ciudad',
    example: 'Guatemala',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  nombre!: string;
}

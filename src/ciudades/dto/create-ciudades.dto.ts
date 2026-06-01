import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCiudadesDto {
  @ApiProperty({
    description: 'Nombre único de la ciudad',
    example: 'Guatemala',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;
}

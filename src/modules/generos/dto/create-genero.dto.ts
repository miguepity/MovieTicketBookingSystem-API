import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({
    description: 'Nombre único del género',
    example: 'Acción',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;
}

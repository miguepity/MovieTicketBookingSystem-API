import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({
    description: 'Nombre único del género',
    example: 'Acción',
    maxLength: 60,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;
}

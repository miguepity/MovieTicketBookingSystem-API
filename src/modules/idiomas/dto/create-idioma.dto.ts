import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIdiomaDto {
  @ApiProperty({
    description: 'Nombre único del idioma',
    example: 'Español',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;
}

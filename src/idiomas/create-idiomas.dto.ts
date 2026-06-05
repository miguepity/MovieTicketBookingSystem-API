import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIdiomaDto {
  @ApiProperty({ example: 'ESPAÑOL LATINO', description: 'Nombre único del idioma o doblaje' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del idioma es obligatorio' })
  @MaxLength(60, { message: 'El nombre no puede exceder los 60 caracteres' })
  nombre!: string;
}
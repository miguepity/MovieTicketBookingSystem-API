import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIdiomaDto {
  @ApiProperty({ description: 'Nombre del idioma', example: 'Español' })
  @IsString()
  @Length(2, 60, { message: 'El nombre debe tener entre 2 y 60 caracteres' })
  nombre: string;
}

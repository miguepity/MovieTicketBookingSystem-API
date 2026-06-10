import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIdiomaDto {
  @ApiProperty({
    description: 'Nombre del idioma',
    example: 'Español',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Descripción del idioma',
    example: 'Idioma español para películas y subtítulos',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;
}

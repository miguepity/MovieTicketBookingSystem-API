import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCiudadDto {
  @ApiProperty({ example: 'San Pedro Sula', description: 'Nombre único de la ciudad' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la ciudad es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
  nombre!: string;
}
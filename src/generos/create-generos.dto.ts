import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({ example: 'ACCION', description: 'Nombre único del género cinematográfico' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del género es obligatorio' })
  @MaxLength(60, { message: 'El nombre no puede exceder los 60 caracteres' })
  nombre!: string;
}
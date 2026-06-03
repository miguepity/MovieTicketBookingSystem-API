import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateCineDto {
  @ApiProperty({ example: 'Cinepolis Altara', description: 'Nombre del cine' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cine es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre!: string;

  @ApiProperty({ example: 'Blvd. Armenta, Centro Comercial Altara', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La dirección no puede exceder los 255 caracteres' })
  direccion?: string;

  @ApiProperty({ example: 1, description: 'ID de la ciudad a la que pertenece' })
  @IsInt({ message: 'El id_ciudad debe ser un número entero válido' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  id_ciudad!: number;
}
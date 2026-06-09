import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSalaDto {
  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'Sala 1',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/, {
    message:
      'El nombre solo puede contener letras, números, espacios y guiones',
  })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre: string;

  @ApiProperty({
    description: 'Número de filas',
    example: 5,
    minimum: 1,
    maximum: 26,
  })
  @IsInt({ message: 'Las filas deben ser un número entero' })
  @Min(1, { message: 'El número de filas debe ser al menos 1' })
  @Max(26, { message: 'El número máximo de filas es 26' })
  filas: number;

  @ApiProperty({
    description: 'Número de columnas',
    example: 10,
    minimum: 1,
    maximum: 30,
  })
  @IsInt({ message: 'Las columnas deben ser un número entero' })
  @Min(1, { message: 'El número de columnas debe ser al menos 1' })
  @Max(30, { message: 'El número máximo de columnas es 30' })
  columnas: number;
}

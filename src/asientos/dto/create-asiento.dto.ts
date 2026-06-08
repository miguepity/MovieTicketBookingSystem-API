import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateAsientoDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la sala a la que pertenece el asiento',
  })
  @IsInt()
  @Min(1)
  id_sala!: number;

  @ApiProperty({
    example: 'A1',
    description: 'Fila del asiento (máx. 2 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  fila!: string;

  @ApiProperty({ example: 5, description: 'Número de columna del asiento' })
  @IsInt()
  @Min(1)
  columna!: number;

  @ApiProperty({
    example: 'A1-05',
    description: 'Código único del asiento (máx. 10 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiProperty({
    example: 'ESTANDAR',
    description: 'Tipo de asiento (ej: ESTANDAR, VIP, PREFERENCIAL)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  tipo!: string;
}

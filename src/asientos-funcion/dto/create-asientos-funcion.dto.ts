import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateAsientosFuncionDto {
  @ApiProperty({ example: 1, description: 'ID del asiento' })
  @IsInt()
  @Min(1)
  id_asiento!: number;

  @ApiProperty({ example: 1, description: 'ID de la función' })
  @IsInt()
  @Min(1)
  id_funcion!: number;

  @ApiProperty({
    example: 'disponible',
    description: 'Estado del asiento (disponible, bloqueado, reservado)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  estado!: string;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que bloquea el asiento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_usuario?: number;

  @ApiProperty({
    example: 1,
    description: 'Versión para control de concurrencia',
  })
  @IsInt()
  @Min(0)
  version!: number;
}

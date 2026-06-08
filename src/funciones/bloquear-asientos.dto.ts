import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator';

export class BloquearAsientosDto {
  @ApiProperty({ example: [104, 108], description: 'Arreglo de IDs de la tabla AsientosFuncion' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  asientosFuncionIds!: number[];

  @ApiProperty({ example: 5, description: 'Minutos de duración del bloqueo', required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  minutosExpiracion?: number;
}
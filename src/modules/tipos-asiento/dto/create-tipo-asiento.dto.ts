import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateTipoAsientoDto {
  @ApiProperty({
    description: 'Nombre único del tipo de asiento',
    example: 'preferencial',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Color hexadecimal asociado al tipo de asiento (#RRGGBB)',
    example: '#FF8800',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color debe ser un hexadecimal con formato #RRGGBB',
  })
  color?: string;
}

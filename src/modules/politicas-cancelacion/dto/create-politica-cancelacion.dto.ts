import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ReglaPoliticaDto } from './regla-politica.dto';

export class CreatePoliticaCancelacionDto {
  @ApiProperty({
    description: 'ID del cine al que se aplica esta política',
    type: String,
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  id_cine!: string;

  @ApiProperty({
    description: 'Nombre de la política de cancelación',
    type: String,
    example: 'Política Cine A 2026',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    description: 'Reglas que conforman esta política (al menos una)',
    type: () => ReglaPoliticaDto,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaDto)
  reglas!: ReglaPoliticaDto[];
}

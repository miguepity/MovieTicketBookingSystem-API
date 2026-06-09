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
  @ApiProperty({ example: '1', description: 'ID del cine' })
  @IsString()
  @IsNotEmpty()
  id_cine!: string;

  @ApiProperty({ example: 'Política Cine A 2026', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ type: [ReglaPoliticaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaDto)
  reglas!: ReglaPoliticaDto[];
}

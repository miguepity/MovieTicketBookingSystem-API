import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ReglaPoliticaDto } from './regla-politica.dto';

export class UpdatePoliticasCancelacionDto {
  @ApiPropertyOptional({ example: 'Política Cine A 2026 v2' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ type: [ReglaPoliticaDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaDto)
  reglas?: ReglaPoliticaDto[];
}

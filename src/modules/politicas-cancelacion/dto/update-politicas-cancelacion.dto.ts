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
  @ApiPropertyOptional({
    description: 'Nombre actualizado de la política de cancelación',
    type: String,
    example: 'Política Cine A 2026 v2',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Reglas actualizadas que conforman esta política',
    type: () => ReglaPoliticaDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaDto)
  reglas?: ReglaPoliticaDto[];
}

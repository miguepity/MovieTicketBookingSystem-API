import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AsignacionDto {
  @ApiProperty({ example: '42', description: 'ID del asiento a actualizar' })
  @IsString()
  id_asiento!: string;

  @ApiProperty({ example: '2', description: 'ID del nuevo tipo de asiento' })
  @IsString()
  id_tipo_asiento!: string;
}

export class UpdateAsientosBatchDto {
  @ApiProperty({
    type: [AsignacionDto],
    description: 'Lista de asignaciones (id_asiento → id_tipo_asiento). Solo enviar los que cambiaron.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AsignacionDto)
  asignaciones!: AsignacionDto[];
}

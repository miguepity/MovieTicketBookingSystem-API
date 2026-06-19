import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoPeliculaDto {
  @ApiProperty({ example: false })
  @IsNotEmpty({ message: 'El estado activo/inactivo es requerido.' })
  @IsBoolean()
  activo!: boolean;
}

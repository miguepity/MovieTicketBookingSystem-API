import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetActivoDto {
  @ApiProperty({ description: 'Nuevo valor de activo', example: true })
  @IsBoolean()
  activo!: boolean;
}

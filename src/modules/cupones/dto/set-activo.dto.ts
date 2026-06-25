import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetActivoCuponDto {
  @ApiProperty({
    description: 'Activar o desactivar el cupón',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  activo!: boolean;
}

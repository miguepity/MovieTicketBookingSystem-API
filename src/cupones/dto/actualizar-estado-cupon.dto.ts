import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarEstadoCuponDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  activo: boolean;
}

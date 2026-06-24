import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RechazarReembolsoDto {
  @ApiProperty({ description: 'Motivo del rechazo (mínimo 3 caracteres)', minLength: 3 })
  @IsString()
  @MinLength(3)
  motivo: string;
}

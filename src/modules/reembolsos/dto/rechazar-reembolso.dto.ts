import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RechazarReembolsoDto {
  @ApiProperty({
    description: 'Motivo del rechazo',
    example: 'Documentación incompleta',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  motivo!: string;
}

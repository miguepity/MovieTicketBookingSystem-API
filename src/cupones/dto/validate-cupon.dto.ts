import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ValidateCuponDto {
  @ApiProperty({ example: 'DESC20', description: 'Código del cupón a validar' })
  @IsString()
  @MaxLength(50)
  codigo: string;
}

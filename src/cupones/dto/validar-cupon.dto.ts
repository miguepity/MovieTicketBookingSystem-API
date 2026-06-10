import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidarCuponDto {
  @ApiProperty({ example: 'PROMO2026' })
  @IsString()
  @IsNotEmpty()
  codigo: string;
}

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeneroDto {
  @ApiProperty({ example: 'Acción', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre: string;
}

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIdiomaDto {
  @ApiProperty({ example: 'Español', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre: string;
}

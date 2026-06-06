import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre único del rol',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre!: string;
}

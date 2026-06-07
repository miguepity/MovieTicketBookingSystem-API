import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Nombre único del rol en mayúsculas' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  @MaxLength(30, { message: 'El nombre del rol no puede exceder los 30 caracteres' })
  nombre!: string;
}
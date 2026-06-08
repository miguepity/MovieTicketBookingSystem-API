import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Nombre del rol' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre: string;
}

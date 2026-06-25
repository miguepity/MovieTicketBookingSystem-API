import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre único del rol',
    type: String,
    maxLength: 30,
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Lista de permisos asociados al rol',
    type: [String],
    example: ['usuarios.crear', 'usuarios.editar', 'usuarios.eliminar'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permisos?: string[];
}

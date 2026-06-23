import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiProperty({
    description: 'Nombre del usuario (máximo 150 caracteres)',
    example: 'Juan Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiProperty({
    description: 'Teléfono del usuario (máximo 20 caracteres)',
    example: '+502 1234 5678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiProperty({
    description: 'Activar o desactivar notificaciones',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notificaciones_activas?: boolean;
}

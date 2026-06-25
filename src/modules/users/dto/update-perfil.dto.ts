import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario (máximo 150 caracteres)',
    example: 'Juan Pérez',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario (máximo 20 caracteres)',
    example: '+502 1234 5678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Activar o desactivar notificaciones',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notificaciones_activas?: boolean;
}

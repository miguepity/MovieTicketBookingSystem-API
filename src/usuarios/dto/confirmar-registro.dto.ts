import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmarRegistroDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6g7h8i9j0', description: 'Token de confirmación enviado por correo' })
  @IsString()
  @IsNotEmpty({ message: 'El token de confirmación es requerido.' })
  token: string;
}

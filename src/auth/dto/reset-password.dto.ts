import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'usuario@gmail.com.mpxaodw9.e87ovd1qhl.bjvbruq4hup',
    description: 'Token recibido en el correo de recuperacion',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token!: string;

  @ApiProperty({
    example: 'NuevaPassword123',
    description: 'Nueva contrasena del usuario',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contrasena es obligatoria' })
  @MinLength(8, { message: 'La nueva contrasena debe tener al menos 8 caracteres' })
  newPassword!: string;
}

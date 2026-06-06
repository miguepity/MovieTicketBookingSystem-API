import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida.' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida.' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres.',
  })
  newPassword: string;
}

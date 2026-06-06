import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email del usuario para recuperar la contraseña',
    example: 'usuario@email.com',
  })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@gmail.com',
    description: 'Correo del usuario que solicita recuperar su contrasena',
  })
  @IsEmail({}, { message: 'El email no es valido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;
}

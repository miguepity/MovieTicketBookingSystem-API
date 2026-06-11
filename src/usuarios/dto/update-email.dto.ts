import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty({ example: 'nuevo@correo.com' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty()
  newEmail: string;
}

import { IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty()
  newEmail: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @ApiProperty({
    description: 'Nuevo email del usuario',
    example: 'nuevo@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail!: string;
}

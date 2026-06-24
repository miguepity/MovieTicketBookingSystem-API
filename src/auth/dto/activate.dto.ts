import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de confirmación enviado por correo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;
}

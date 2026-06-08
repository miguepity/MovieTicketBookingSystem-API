import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Juan Perez',
    description: 'Nombre completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    example: 'juan.nuevo@example.com',
    description: 'Nuevo correo electrónico',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+50211223344',
    description: 'Teléfono',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}

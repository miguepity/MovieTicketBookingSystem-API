import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearStaffDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

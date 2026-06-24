import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsPositive()
  resultados?: number;
}

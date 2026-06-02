import { IsDateString, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCiudadeDto {
  @IsNumber()
  id!: number;

  @IsString()
  nombre!: string;

  @IsDateString()
  @IsOptional()
  created_at?: string;
}

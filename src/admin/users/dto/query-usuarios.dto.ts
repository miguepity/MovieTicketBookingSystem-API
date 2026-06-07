import { IsOptional } from 'class-validator';

export class QueryUsuariosDto {
  @IsOptional()
  nombre?: string;
  @IsOptional()
  email?: string;
  @IsOptional()
  estado?: string;
  @IsOptional()
  page?: string;
  @IsOptional()
  limit?: string;
}

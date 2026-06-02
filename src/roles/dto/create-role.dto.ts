import { IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNumber()
  id!: number;

  @IsString()
  nombre!: string;
}

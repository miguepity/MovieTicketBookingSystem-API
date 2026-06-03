import { IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  nombre!: string;
}

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre: string;
}

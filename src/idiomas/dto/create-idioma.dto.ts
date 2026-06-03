import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateIdiomaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre: string;
}

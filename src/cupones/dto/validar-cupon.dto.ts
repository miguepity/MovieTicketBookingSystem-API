import { IsString, IsNotEmpty } from 'class-validator';

export class ValidarCuponDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;
}

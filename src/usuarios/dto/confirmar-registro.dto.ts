import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmarRegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de confirmación es requerido.' })
  token: string;
}

import { IsNotEmpty, IsNumber } from 'class-validator';

export class ParamDto {
  @IsNumber({}, { message: 'must be a number' })
  @IsNotEmpty({ message: 'must no be empty' })
  id_usuario!: number;
}

import { IsNotEmpty, IsNumber } from 'class-validator';

export class ParamDto {
  @IsNumber()
  @IsNotEmpty()
  id!: number;
}

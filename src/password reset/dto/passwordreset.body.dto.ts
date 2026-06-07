import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BodyDto {
  @IsNumber({}, { message: 'must be a number' })
  @IsNotEmpty({ message: 'must no be empty' })
  id_usuario!: number;

  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'must no be empty' })
  token!: string;

  @IsDateString({}, { message: 'must be a date' })
  @IsNotEmpty({ message: 'must no be empty' })
  expires_at!: Date;
}

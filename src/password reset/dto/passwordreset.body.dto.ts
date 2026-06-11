import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BodyDto {
  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsNotEmpty({ message: 'must no be empty' })
  id_usuario!: number;

  @ApiProperty({ example: 'a1b2c3d4e5f6g7h8i9j0' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'must no be empty' })
  token!: string;

  @ApiProperty({ example: '2026-06-10T12:00:00Z' })
  @IsDateString({}, { message: 'must be a date' })
  @IsNotEmpty({ message: 'must no be empty' })
  expires_at!: Date;
}

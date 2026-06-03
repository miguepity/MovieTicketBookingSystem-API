import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateSalaDto {
  @ApiProperty({ example: 'Sala 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  filas!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  columnas!: number;

  @ApiProperty({ type: String, example: '1' })
  @Transform(({ value }) => BigInt(value as string | number))
  id_cine!: bigint;
}

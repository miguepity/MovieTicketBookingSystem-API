import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCineDto {
  @ApiProperty({
    description: 'Nombre del cine',
    example: 'Cinépolis Plaza Mayor',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Dirección física del cine',
    example: 'Av. Principal 123, Ciudad de México',
    maxLength: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @ApiProperty({
    description: 'ID de la ciudad',
    type: String,
    example: '1',
  })
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value as string | number))
  id_ciudad!: string;
}

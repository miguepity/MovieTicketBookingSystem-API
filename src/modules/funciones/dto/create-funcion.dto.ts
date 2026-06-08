import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreateFuncionDto {
  @ApiProperty({
    description: 'ID de la película',
    example: '1',
  })
  @IsString()
  id_pelicula!: string;

  @ApiProperty({
    description: 'ID de la sala',
    example: '1',
  })
  @IsString()
  id_sala!: string;

  @ApiProperty({
    description: 'Fecha y hora de la función',
    example: '2026-12-31T20:30:00.000Z',
  })
  @IsDateString()
  fecha_hora!: string;

  @ApiProperty({
    description: 'Estado de la función',
    example: 'activa',
  })
  @IsString()
  estado!: string;
}

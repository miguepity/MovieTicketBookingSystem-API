import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum } from 'class-validator';
import { EstadoFuncion } from '../../../common/enums/estado-funcion.enum';

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
    description: 'Estado inicial de la función',
    enum: EstadoFuncion,
    example: EstadoFuncion.PROGRAMADA,
  })
  @IsEnum(EstadoFuncion)
  estado!: EstadoFuncion;
}

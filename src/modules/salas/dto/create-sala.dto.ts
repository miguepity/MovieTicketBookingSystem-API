import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CreateCineDto } from '../../cines/dto/create-cine.dto';
import { CreateFuncionDto } from '../../funciones/dto/create-funcion.dto';
import { CreateAsientoDto } from '../../asientos/dto/create-asientos.dto';

export class CreateSalaDto {
  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  columnas!: number;

  @ApiProperty()
  filas!: number;

  @ApiProperty()
  id_cine!: number;

  // Relaciones con otras entidades (errores actuales)
  @ApiProperty({ type: () => CreateCineDto })
  cines!: CreateCineDto;

  @ApiPropertyOptional({ type: () => [CreateFuncionDto] })
  funciones?: CreateFuncionDto[];

  @ApiProperty({ type: () => [CreateAsientoDto] })
  asientos?: CreateAsientoDto[];
}

import { ApiProperty } from '@nestjs/swagger';

export class CiudadResumenDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ example: 'Ciudad de México' })
  nombre!: string;
}

export class FuncionResumenDto {
  @ApiProperty({ type: String, example: '10' })
  id!: string;

  @ApiProperty({ example: '2026-07-01T20:30:00.000Z', format: 'date-time' })
  fecha_hora!: string;

  @ApiProperty({ example: 'programada' })
  estado!: string;
}

export class SalaConFuncionesDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ example: 'Sala 2' })
  nombre!: string;

  @ApiProperty({ type: FuncionResumenDto, isArray: true })
  funciones!: FuncionResumenDto[];
}

export class CineConFuncionesResponseDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ example: 'Cinépolis Plaza Mayor' })
  nombre!: string;

  @ApiProperty({ example: 'Av. Principal 123, Ciudad de México', nullable: true, required: false })
  direccion!: string | null;

  @ApiProperty({ type: String, example: '1' })
  id_ciudad!: string;

  @ApiProperty({ type: CiudadResumenDto })
  ciudades!: CiudadResumenDto;

  @ApiProperty({ type: SalaConFuncionesDto, isArray: true })
  salas!: SalaConFuncionesDto[];
}

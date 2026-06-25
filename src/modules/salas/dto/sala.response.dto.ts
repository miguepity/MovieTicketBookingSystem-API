import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalaResponseDto {
  @ApiProperty({
    description: 'ID de la sala (serializado como string)',
    type: String,
    example: '1',
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'Sala 1',
  })
  nombre!: string;

  @ApiProperty({
    description: 'ID del cine asociado (serializado como string)',
    type: String,
    example: '1',
  })
  id_cine!: number;

  @ApiProperty({
    description: 'Número de filas en la sala',
    example: 10,
  })
  filas!: number;

  @ApiProperty({
    description: 'Número de columnas en la sala',
    example: 10,
  })
  columnas!: number;

  @ApiPropertyOptional({
    description: 'Advertencia cuando la sala tiene funciones activas',
    example:
      'La sala tiene 3 función(es) activa(s). Los cambios pueden afectar las reservas existentes.',
  })
  warning?: string;
}

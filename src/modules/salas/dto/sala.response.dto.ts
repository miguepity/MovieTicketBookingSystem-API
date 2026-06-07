import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalaResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() id_cine!: number;
  @ApiProperty() filas!: number;
  @ApiProperty() columnas!: number;
  @ApiPropertyOptional({
    description: 'Advertencia cuando la sala tiene funciones activas',
    example:
      'La sala tiene 3 función(es) activa(s). Los cambios pueden afectar las reservas existentes.',
  })
  warning?: string;
}

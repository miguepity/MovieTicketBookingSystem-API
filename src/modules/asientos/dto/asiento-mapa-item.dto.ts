import { ApiProperty } from '@nestjs/swagger';

export class AsientoMapaItemDto {
  @ApiProperty({ type: String, description: 'ID de asiento-función', example: '12' })
  id_asiento_funcion!: string;

  @ApiProperty({ type: String, description: 'Fila del asiento', example: 'A' })
  fila!: string;

  @ApiProperty({ type: Number, description: 'Columna del asiento', example: 3 })
  columna!: number;

  @ApiProperty({ type: String, description: 'Código de asiento', example: 'A-03' })
  codigo!: string;

  @ApiProperty({ type: String, description: 'Tipo de asiento', example: 'Estándar' })
  tipo!: string;

  @ApiProperty({ type: String, description: 'Estado del asiento (DISPONIBLE, BLOQUEADO, RESERVADO)', example: 'DISPONIBLE' })
  estado!: string;

  @ApiProperty({ type: Boolean, description: 'Indica si el asiento está bloqueado por el usuario actual', example: false })
  es_mio!: boolean;
}

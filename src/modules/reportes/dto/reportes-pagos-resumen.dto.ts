import { ApiProperty } from '@nestjs/swagger';

export class ReportesPagosResumenDto {
  @ApiProperty({
    description: 'Suma total de montos originales de los pagos filtrados',
    type: Number,
    example: 12345.67,
  })
  totalMontoOriginal!: number;

  @ApiProperty({
    description: 'Suma total de montos finales (tras descuentos) de los pagos filtrados',
    type: Number,
    example: 10500.5,
  })
  totalMontoFinal!: number;
}

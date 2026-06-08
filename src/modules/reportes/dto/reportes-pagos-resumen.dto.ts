import { ApiProperty } from '@nestjs/swagger';

export class ReportesPagosResumenDto {
  @ApiProperty() totalMontoOriginal!: number;
  @ApiProperty() totalMontoFinal!: number;
}

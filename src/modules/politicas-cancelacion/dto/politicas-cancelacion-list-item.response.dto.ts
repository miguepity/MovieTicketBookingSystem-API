import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PoliticasCancelacionListItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() horas_antes_minimo!: number;
  @ApiPropertyOptional() horas_antes_maximo!: number | null;
  @ApiProperty() porcentaje_reembolso!: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class ReporteReembolsoDto {
  @ApiProperty() id!: string;
  @ApiProperty() montoReembolso!: number;
}

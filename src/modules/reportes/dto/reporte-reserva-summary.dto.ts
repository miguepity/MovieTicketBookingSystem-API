import { ApiProperty } from '@nestjs/swagger';

export class ReporteReservasDto {
  @ApiProperty() id!: string;
  @ApiProperty() numeroReserva!: string;
}

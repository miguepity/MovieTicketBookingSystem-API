import { ApiProperty } from '@nestjs/swagger';

export class ReporteUsuarioDto {
  @ApiProperty() id!: string;
  @ApiProperty() nombre!: string;
}

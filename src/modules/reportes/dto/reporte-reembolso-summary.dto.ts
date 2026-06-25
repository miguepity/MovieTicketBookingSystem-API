import { ApiProperty } from '@nestjs/swagger';

export class ReporteReembolsoDto {
  @ApiProperty({
    description: 'ID del reembolso',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Monto reembolsado al cliente',
    type: Number,
    example: 12345.67,
  })
  montoReembolso!: number;
}

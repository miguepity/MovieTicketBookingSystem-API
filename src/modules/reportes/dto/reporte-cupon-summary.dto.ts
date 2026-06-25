import { ApiProperty } from '@nestjs/swagger';

export class ReporteCuponDto {
  @ApiProperty({
    description: 'ID del cupón',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Código único del cupón',
    example: 'DESCUENTO20',
  })
  codigo!: string;
}

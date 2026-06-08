import { ApiProperty } from '@nestjs/swagger';

export class CuponEntity {
  @ApiProperty({ example: '1' })
  id: bigint;

  @ApiProperty({ example: 'DESC20' })
  codigo: string;

  @ApiProperty({ example: 'descuento' })
  tipo: string;

  @ApiProperty({ example: '20.50' })
  valor: number;

  @ApiProperty({ example: '2025-12-31' })
  fecha_expiracion: Date;

  @ApiProperty({ example: 100 })
  usos_maximos?: number;

  @ApiProperty({ example: 0 })
  usos_actuales: number;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;
}

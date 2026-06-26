import { ApiProperty } from '@nestjs/swagger';

export class CuponResponseDto {
  @ApiProperty({ example: '1', type: String })
  id!: string;

  @ApiProperty({ example: 'PROMO10' })
  codigo!: string;

  @ApiProperty({ example: 'porcentaje' })
  tipo!: string;

  @ApiProperty({ example: 10 })
  valor!: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    format: 'date-time',
    type: String,
  })
  fecha_expiracion!: string;

  @ApiProperty({ example: 100, nullable: true, required: false })
  usos_maximos!: number | null;

  @ApiProperty({ example: 0 })
  usos_actuales!: number;

  @ApiProperty({ example: 'Promo Verano', nullable: true, required: false })
  titulo!: string | null;

  @ApiProperty({
    example: 'Disfruta un 10 % de descuento en tu primera compra.',
    nullable: true,
    required: false,
  })
  descripcion!: string | null;

  @ApiProperty({ example: true })
  activo!: boolean;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  created_at!: string;
}

export class CuponActivoResponseDto {
  @ApiProperty({ example: '1', type: String })
  id!: string;

  @ApiProperty({ example: 'PROMO10' })
  codigo!: string;

  @ApiProperty({ example: true })
  activo!: boolean;
}

export class ValidarCuponResponseDto {
  @ApiProperty({ example: true })
  valido!: boolean;

  @ApiProperty({ example: 'PROMO10' })
  codigo!: string;

  @ApiProperty({ example: 'porcentaje' })
  tipo!: string;

  @ApiProperty({ example: 10 })
  valor!: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    format: 'date-time',
    type: String,
  })
  fecha_expiracion!: string;
}

export class CuponEliminadoResponseDto {
  @ApiProperty({ example: '1', type: String })
  id!: string;

  @ApiProperty({ example: true })
  eliminado!: boolean;
}

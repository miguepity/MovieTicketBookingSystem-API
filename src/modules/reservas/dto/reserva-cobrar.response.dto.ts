import { ApiProperty } from '@nestjs/swagger';

export class ReservaCobrarAsientoDto {
  @ApiProperty({ example: '42' })
  id!: string;

  @ApiProperty({ example: 'D5' })
  codigo!: string;

  @ApiProperty({ example: 'Estandar' })
  tipo!: string;

  @ApiProperty({ example: 70, description: 'Precio unitario del asiento según precios_cine' })
  precio!: number;
}

export class ReservaCobrarClienteDto {
  @ApiProperty({ example: '12' })
  id!: string;

  @ApiProperty({ example: 'Andrea López' })
  nombre!: string;

  @ApiProperty({ example: 'andrea.lopez@gmail.com' })
  email!: string;

  @ApiProperty({ example: '+504 3000-1234', nullable: true })
  telefono!: string | null;
}

export class ReservaCobrarPeliculaRefDto {
  @ApiProperty({ example: '7' })
  id!: string;

  @ApiProperty({ example: 'Tormenta sobre el Pacífico' })
  titulo!: string;
}

export class ReservaCobrarFuncionRefDto {
  @ApiProperty({ example: '99' })
  id!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  fecha_hora!: Date;
}

export class ReservaCobrarSalaRefDto {
  @ApiProperty({ example: '4' })
  id!: string;

  @ApiProperty({ example: 'Sala 4 VIP' })
  nombre!: string;
}

export class ReservaCobrarCineRefDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Cinépolis Oakland Mall' })
  nombre!: string;
}

export class ReservaCobrarResponseDto {
  @ApiProperty({ example: '1234' })
  id!: string;

  @ApiProperty({ example: 'RES-20260626-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ example: 'pendiente_pago', enum: ['pendiente_pago', 'pagada', 'cancelada', 'reembolsada', 'expirada'] })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true, description: 'Cuándo expira el lock de la reserva. null si ya no aplica.' })
  expira_en!: Date | null;

  @ApiProperty({ type: ReservaCobrarClienteDto })
  cliente!: ReservaCobrarClienteDto;

  @ApiProperty({ type: ReservaCobrarPeliculaRefDto })
  pelicula!: ReservaCobrarPeliculaRefDto;

  @ApiProperty({ type: ReservaCobrarFuncionRefDto })
  funcion!: ReservaCobrarFuncionRefDto;

  @ApiProperty({ type: ReservaCobrarSalaRefDto })
  sala!: ReservaCobrarSalaRefDto;

  @ApiProperty({ type: ReservaCobrarCineRefDto })
  cine!: ReservaCobrarCineRefDto;

  @ApiProperty({ type: [ReservaCobrarAsientoDto] })
  asientos!: ReservaCobrarAsientoDto[];

  @ApiProperty({ example: 4 })
  num_asientos!: number;

  @ApiProperty({ example: 280, description: 'Suma de precios sin descuento. El descuento de cupón se aplica al confirmar el pago.' })
  monto_total!: number;
}

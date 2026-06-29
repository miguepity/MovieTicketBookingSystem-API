import { ApiProperty } from '@nestjs/swagger';
import { AsientoSalaDto } from '../../asientos/dto/asiento-sala.dto';

export class AdminUsuarioAsientoDto {
  @ApiProperty({ type: String, description: 'ID del usuario', example: '7' })
  id!: string;

  @ApiProperty({
    type: String,
    description: 'Email del usuario',
    example: 'cliente@cinema.com',
  })
  email!: string;
}

export class AdminAsientoMapaItemDto {
  @ApiProperty({
    type: String,
    description: 'ID de asiento-función',
    example: '345',
  })
  id_asiento_funcion!: string;

  @ApiProperty({ type: String, description: 'Fila del asiento', example: 'A' })
  fila!: string;

  @ApiProperty({ type: Number, description: 'Columna del asiento', example: 3 })
  columna!: number;

  @ApiProperty({
    type: String,
    description: 'Código de asiento',
    example: 'A-03',
  })
  codigo!: string;

  @ApiProperty({
    type: String,
    description: 'Nombre del tipo de asiento',
    example: 'preferencial',
  })
  tipo!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Color hex del tipo de asiento',
    example: '#F59E0B',
  })
  color!: string | null;

  @ApiProperty({
    type: String,
    description: 'Estado calculado (expirados → disponible)',
    enum: ['disponible', 'bloqueado', 'reservado', 'ocupado'],
    example: 'reservado',
  })
  estado!: string;

  @ApiProperty({
    type: Number,
    description: 'Precio resuelto del asiento',
    example: 100,
  })
  precio!: number;

  @ApiProperty({
    type: () => AdminUsuarioAsientoDto,
    nullable: true,
    description: 'Usuario que tomó el asiento (null si disponible)',
  })
  usuario!: AdminUsuarioAsientoDto | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Hasta cuándo está bloqueado (ISO timestamp; null si disponible)',
    example: '2026-06-29T15:30:00.000Z',
  })
  bloqueado_hasta!: string | null;
}

export class AdminMapaAsientosResponseDto {
  @ApiProperty({ type: String, description: 'ID de la función', example: '12' })
  funcion_id!: string;

  @ApiProperty({
    type: () => AsientoSalaDto,
    description: 'Dimensiones de la sala',
  })
  sala!: AsientoSalaDto;

  @ApiProperty({
    type: () => AdminAsientoMapaItemDto,
    isArray: true,
    description: 'Asientos ordenados por fila/columna',
  })
  asientos!: AdminAsientoMapaItemDto[];
}

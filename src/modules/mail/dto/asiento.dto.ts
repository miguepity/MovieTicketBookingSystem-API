import { ApiProperty } from '@nestjs/swagger';

export class AsientoDto {
  @ApiProperty({
    description: 'Código del asiento (ej. A1, B5)',
    example: 'A1',
  })
  codigo!: string;

  @ApiProperty({
    description: 'Tipo de asiento (ej. Estándar, VIP, Premium)',
    example: 'Estándar',
  })
  tipo!: string;
}

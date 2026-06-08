import { ApiProperty } from '@nestjs/swagger';

export class BloquearAsientoDto {
  @ApiProperty({
    description: 'Asiento a bloquear',
  })
  id_asiento: string;
}

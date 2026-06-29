import { ApiProperty } from '@nestjs/swagger';

export class LiberarAsientoDto {
  @ApiProperty({
    description: 'ID del asiento a liberar',
  })
  id_asiento: string;
}

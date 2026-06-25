import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateClienteEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del cliente',
    example: 'activo',
    enum: ['activo', 'bloqueado'],
    enumName: 'EstadoCliente',
  })
  @IsIn(['activo', 'bloqueado'])
  estado: 'activo' | 'bloqueado';
}

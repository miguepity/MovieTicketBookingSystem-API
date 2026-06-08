import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoDto {
  @ApiProperty({
    example: 'INACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
    description: 'Nuevo estado del usuario',
  })
  @IsEnum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'], {
    message: 'El estado debe ser ACTIVO, INACTIVO o SUSPENDIDO',
  })
  @IsNotEmpty()
  estado!: string;
}

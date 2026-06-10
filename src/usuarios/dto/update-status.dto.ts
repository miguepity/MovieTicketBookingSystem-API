import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: 'activo', enum: ['activo', 'inactivo', 'bloqueado'] })
  @IsString()
  @IsNotEmpty({ message: 'El estado/status es requerido.' })
  @IsIn(['activo', 'inactivo', 'bloqueado'], {
    message:
      'El status debe ser uno de los siguientes valores: activo, inactivo o bloqueado.',
  })
  status: string;
}

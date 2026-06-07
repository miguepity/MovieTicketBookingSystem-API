import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del usuario',
    example: 'inactivo',
    enum: ['activo', 'inactivo', 'suspendido'],
  })
  @IsString()
  @IsIn(['activo', 'inactivo', 'suspendido'], {
    message: 'El estado debe ser activo, inactivo o suspendido',
  })
  estado!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CambiarEstadoAsientoDto {
  @ApiProperty({ 
    example: 'MANTENIMIENTO', 
    description: 'Estado físico de la butaca', 
    enum: ['ESTANDAR', 'MANTENIMIENTO'] 
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ESTANDAR', 'NORMAL', 'MANTENIMIENTO'])
  tipo!: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: 1, description: 'ID del usuario que realiza la reserva' })
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

  @ApiProperty({ example: 1, description: 'ID de la función' })
  @IsNumber()
  @IsNotEmpty()
  id_funcion: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Lista de IDs de asientos de la función (AsientosFuncion)',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  asientosIds: number[];
}

import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearReservaDto {
  @ApiProperty({ example: '1' })
  @IsString()
  id_funcion!: string;

  @ApiProperty({ type: [String], example: ['12', '13'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids_asiento_funcion!: string[];
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeneroDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nombre del genero',
    example: 'Acción',
  })
  nombre: string;
}

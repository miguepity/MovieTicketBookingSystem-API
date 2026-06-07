import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleStatusPeliculaDto {
  @ApiProperty({ example: 1, description: 'ID del usuario que realiza el cambio de estado' })
  @IsInt({ message: 'El id_editor debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_editor es obligatorio' })
  id_editor!: number;
}

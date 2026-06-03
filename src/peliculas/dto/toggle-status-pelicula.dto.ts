import { IsInt, IsNotEmpty } from 'class-validator';

export class ToggleStatusPeliculaDto {
  @IsInt({ message: 'El id_editor debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_editor es obligatorio' })
  id_editor!: number;
}

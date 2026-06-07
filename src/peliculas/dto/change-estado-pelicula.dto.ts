import { IsBoolean } from 'class-validator';

export class ChangeEstadoPeliculaDto {
  @IsBoolean()
  activo!: boolean;
}

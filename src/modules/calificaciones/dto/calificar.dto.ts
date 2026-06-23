import { IsInt, Min, Max } from 'class-validator';

export class CalificarDto {
  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion!: number;
}

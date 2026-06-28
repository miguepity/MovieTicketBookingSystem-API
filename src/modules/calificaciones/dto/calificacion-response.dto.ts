import { ApiProperty } from '@nestjs/swagger';

export class CalificacionMiaResponseDto {
  @ApiProperty({ example: 4 })
  puntuacion!: number;
}

export class CalificarResponseDto {
  @ApiProperty({ example: 4 })
  puntuacion!: number;

  @ApiProperty({ example: 4.3, nullable: true })
  rating_promedio!: number | null;

  @ApiProperty({ example: 10 })
  rating_count!: number;
}

export class BorrarCalificacionResponseDto {
  @ApiProperty({ example: 4.2, nullable: true })
  rating_promedio!: number | null;

  @ApiProperty({ example: 9 })
  rating_count!: number;
}

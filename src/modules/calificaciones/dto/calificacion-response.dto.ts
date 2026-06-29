import { ApiProperty } from '@nestjs/swagger';

export class CalificacionMiaResponseDto {
  @ApiProperty({
    description: 'true si el usuario asistió a al menos una función pasada y pagada de esta película',
    example: true,
  })
  elegible!: boolean;

  @ApiProperty({
    description: 'Puntuación previa del usuario (1-5), o null si no calificó',
    nullable: true,
    type: Number,
    example: 4,
  })
  puntuacion!: number | null;
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

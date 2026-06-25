import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalificarDto {
  @ApiProperty({
    description: 'ID de la película a calificar',
    type: String,
    example: '3',
  })
  @IsString()
  id_pelicula!: string;

  @ApiProperty({
    description: 'Puntuación de la película (1-5 estrellas)',
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion!: number;

  @ApiPropertyOptional({
    description: 'Comentario opcional sobre la película',
    type: String,
    example: 'Excelente película, muy recomendada',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comentario?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetActivoPeliculaDto {
  @ApiProperty({
    description: 'Indica si la película debe estar activa o inactiva',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  activo!: boolean;
}

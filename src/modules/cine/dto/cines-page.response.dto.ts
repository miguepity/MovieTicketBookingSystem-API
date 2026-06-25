import { ApiProperty } from '@nestjs/swagger';
import { CineListItemResponseDto } from './cine-list-item.response.dto';

export class CinesPageResponseDto {
  @ApiProperty({
    description: 'Lista de cines',
    type: () => CineListItemResponseDto,
    isArray: true,
  })
  data!: CineListItemResponseDto[];

  @ApiProperty({
    description: 'Total de cines en la base de datos',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  limit!: number;
}

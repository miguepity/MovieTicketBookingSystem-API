import { ApiProperty } from '@nestjs/swagger';
import { ClienteListItemDto } from './cliente-list-item.dto';

/**
 * Paginated response for `GET /admin/clientes`.
 * Shape: flat `{ data, total, page, limit }` — no nested `meta` object.
 * Matches the actual runtime response from `UsersService.findClientesPaginated`.
 */
export class ClientesPageResponseDto {
  @ApiProperty({
    type: ClienteListItemDto,
    isArray: true,
    description: 'Lista de clientes',
  })
  data!: ClienteListItemDto[];

  @ApiProperty({ description: 'Total de clientes', example: 50 })
  total!: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Tamaño de página', example: 10 })
  limit!: number;
}

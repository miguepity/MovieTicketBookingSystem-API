import { ApiProperty } from '@nestjs/swagger';
import { UsuarioItemDto } from './usuario-item.dto';

/**
 * Pagination metadata nested inside `UserListResponseDto`.
 * Matches the `meta` object returned by `UsersService.findAll`.
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Total de usuarios en la BD', example: 50 })
  total!: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Tamaño de página', example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  totalPages!: number;
}

/**
 * Paginated response for `GET /admin/users`.
 * Shape: `{ data: UsuarioItemDto[], meta: PaginationMetaDto }`.
 * This matches the actual runtime response from `UsersService.findAll`.
 */
export class UserListResponseDto {
  @ApiProperty({
    type: UsuarioItemDto,
    isArray: true,
    description: 'Lista de usuarios',
  })
  data!: UsuarioItemDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Metadatos de paginación' })
  meta!: PaginationMetaDto;
}

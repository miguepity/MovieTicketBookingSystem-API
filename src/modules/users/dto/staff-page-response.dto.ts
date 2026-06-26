import { ApiProperty } from '@nestjs/swagger';
import { StaffListItemDto } from './staff-list-item.dto';

/**
 * Paginated response for `GET /admin/staff`.
 * Flat shape: `{ data, total, page, limit }` — no nested `meta` object.
 * Matches the actual runtime response from `UsersService.findStaffPaginated`.
 */
export class StaffPageResponseDto {
  @ApiProperty({
    type: StaffListItemDto,
    isArray: true,
    description: 'Lista de staff',
  })
  data!: StaffListItemDto[];

  @ApiProperty({ description: 'Total de staff', example: 5 })
  total!: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Tamaño de página', example: 10 })
  limit!: number;
}

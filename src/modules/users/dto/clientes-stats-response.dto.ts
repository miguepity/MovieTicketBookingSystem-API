import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for `GET /admin/clientes/stats`.
 * Matches runtime output of `UsersService.findClientesStats`:
 * { total, activos, bloqueados }
 */
export class ClientesStatsResponseDto {
  @ApiProperty({ description: 'Total de clientes registrados', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Clientes con estado activo', example: 80 })
  activos!: number;

  @ApiProperty({ description: 'Clientes con estado bloqueado', example: 20 })
  bloqueados!: number;
}

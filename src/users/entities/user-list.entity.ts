import { ApiProperty } from '@nestjs/swagger';

class UsuarioItem {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ example: 'juan@email.com' })
  email!: string;

  @ApiProperty({ example: '+502 5555-0001', nullable: true })
  telefono!: string | null;

  @ApiProperty({ example: 'activo' })
  estado!: string;

  @ApiProperty({ example: '1' })
  id_rol!: string;

  @ApiProperty({ example: 'cliente' })
  rol!: string;

  @ApiProperty({ example: false })
  notificaciones_activas!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  created_at!: Date;
}

class PaginationMeta {
  @ApiProperty({ example: 50 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class UserListResponse {
  @ApiProperty({ type: [UsuarioItem] })
  data!: UsuarioItem[];

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta;
}

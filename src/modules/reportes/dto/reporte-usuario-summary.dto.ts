import { ApiProperty } from '@nestjs/swagger';

export class ReporteUsuarioDto {
  @ApiProperty({
    description: 'ID del usuario',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'María García López',
  })
  nombre!: string;
}

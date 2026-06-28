import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSalaDto } from './create-sala.dto';

export class UpdateSalaDto extends PartialType(CreateSalaDto) {
  @ApiPropertyOptional({
    description:
      'Confirma explícitamente el cambio de dimensiones cuando hay funciones activas con reservas. Sin este flag, el backend devuelve 409 requiresConfirmation.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

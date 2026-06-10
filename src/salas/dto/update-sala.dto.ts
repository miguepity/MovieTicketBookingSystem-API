import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateSalaDto {
  @ApiPropertyOptional({
    description: 'Nombre de la sala',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/, {
    message:
      'El nombre solo puede contener letras, números, espacios y guiones',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  nombre?: string;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReservaDto } from './create-reserva.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateReservaDto {
  @ApiProperty({
    example: 'completed',
    description: 'Estado de la reserva',
    required: false,
  })
  @IsString()
  @IsOptional()
  estado?: string;
}

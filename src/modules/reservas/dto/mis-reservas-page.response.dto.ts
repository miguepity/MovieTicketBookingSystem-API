import { ApiProperty } from '@nestjs/swagger';
import { BoletoResponseDto } from './boleto.response.dto';

export class MisReservasPageResponseDto {
  @ApiProperty({ type: BoletoResponseDto, isArray: true })
  data!: BoletoResponseDto[];

  @ApiProperty({ type: Number, example: 23 })
  total!: number;

  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 5 })
  limit!: number;
}

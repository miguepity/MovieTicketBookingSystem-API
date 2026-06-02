import { ApiProperty } from '@nestjs/swagger';

export class SalaListItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  
}

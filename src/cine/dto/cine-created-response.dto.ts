import { ApiProperty } from '@nestjs/swagger';

export class CineCreatedResponseDto {
  @ApiProperty() id!: number;
}

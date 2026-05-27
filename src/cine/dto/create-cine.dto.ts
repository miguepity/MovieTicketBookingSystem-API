import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCineDto {
  @ApiProperty() nombre!:  string;
  @ApiPropertyOptional() direccion!:  string;
  @ApiProperty() id_ciudad!:  number;
}

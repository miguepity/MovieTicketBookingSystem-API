import { ApiProperty } from '@nestjs/swagger';

export class ReportePeliculaDto {
  @ApiProperty() id!: string;
  @ApiProperty() titulo!: string;
}

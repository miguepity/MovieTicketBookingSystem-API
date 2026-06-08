import { ApiProperty } from '@nestjs/swagger';

export class ReporteCineDto {
  @ApiProperty() id!: string;
  @ApiProperty() nombre!: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class ReporteCuponDto {
  @ApiProperty() id!: string;
  @ApiProperty() codigo!: string;
}

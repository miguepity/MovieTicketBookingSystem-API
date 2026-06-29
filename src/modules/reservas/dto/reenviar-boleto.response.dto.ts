import { ApiProperty } from '@nestjs/swagger';

export class ReenviarBoletoResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ required: false, example: 42, description: 'Segundos restantes hasta poder reenviar de nuevo. Solo presente cuando ok=false.' })
  retry_after?: number;
}

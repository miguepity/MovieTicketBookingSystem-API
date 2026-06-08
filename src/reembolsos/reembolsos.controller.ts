import { Controller, Post, Body } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';
import { CalcularReembolsoDto } from './dto/calcular-reembolso.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('reembolsos')
@Controller('reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Post('calcular')
  @ApiResponse({ status: 200, description: 'Monto calculado exitosamente.', type: CalcularReembolsoDto })
  @ApiResponse({ status: 400, description: 'Error al calcular el monto de reembolso.' })
  @ApiResponse({ status: 404, description: 'El pago con el ID proporcionado no existe.' })
  @ApiOperation({ summary: 'Calcula el monto de reembolso para un   pago específico' })
  async calcularMontoReembolso(@Body() calcularReembolsoDto: CalcularReembolsoDto) {
    return await this.reembolsosService.calcularReembolso(calcularReembolsoDto);
  }
}
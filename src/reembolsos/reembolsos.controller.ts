import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';
import { CalcularReembolsoDto } from './dto/calcular-reembolso.dto';
import { RegistrarReembolsoEfectivoDto } from './dto/registrar-reembolso-efectivo.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reembolsos')
@Controller('reembolsos')
@ApiBearerAuth('token')
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

  @Post('efectivo')
  @ApiResponse({ status: 201, description: 'Reembolso en efectivo registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'El pago no puede ser reembolsado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN o RECEPCIONISTA.' })
  @ApiResponse({ status: 404, description: 'El pago con el ID proporcionado no existe.' })
  @ApiOperation({ summary: 'Registrar reembolso manual en efectivo y notificar al recepcionista' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPCIONISTA')
  async registrarReembolsoEfectivo(
    @Body() dto: RegistrarReembolsoEfectivoDto,
  ) {
    return await this.reembolsosService.registrarReembolsoEfectivo(dto);
  }
}

import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReembolsoDto } from './dto/create-reembolso.dto';
import { CreateReembolsoEfectivoDto } from './dto/create-reembolso-efectivo.dto';
import { RecepcionistaGuard } from 'src/auth/recepcionista.guard';

@ApiTags('Reembolsos')
@Controller('reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Calcular reembolso para un pago específico',
    responses: {
      201: {
        description: 'Reembolso calculado exitosamente',
        content: {
          'application/json': {
            example: {
              id: 1,
              monto: 150,
              estado: 'procesado',
              fecha_procesado: '2024-06-01T12:00:00.000Z',
              createdAt: '2024-06-01T11:00:00.000Z',
              horas_anticipacion: 48,
              porcentaje_aplicado: 100,
              monto_original: 150,
            },
          },
        },
      },
      400: {
        description:
          'Pago ya reembolsado, funcion ya ocurrio, o no hay politica aplicable',
      },
      401: { description: 'No autorizado' },
      404: { description: 'Pago no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async calcularReembolso(@Body() dto: CreateReembolsoDto) {
    return this.reembolsosService.calcularReembolso(dto);
  }
}

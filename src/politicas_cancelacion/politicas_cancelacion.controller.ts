import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PoliticasCancelacionService } from './politicas_cancelacion.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Políticas de Cancelación')
@Controller('politicas-cancelacion')
export class PoliticasCancelacionController {
  constructor(
    private readonly politicasCancelacionService: PoliticasCancelacionService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLIENTE', 'RECEPCIONISTA')
  @ApiOperation({ summary: 'Listar todas las políticas de cancelación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de políticas de cancelación retornada con éxito.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron políticas de cancelación.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  findAll() {
    return this.politicasCancelacionService.findAll();
  }
}

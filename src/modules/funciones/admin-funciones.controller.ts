import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiConflictResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FuncionesService } from './funciones.service';
import { CheckConflictosQueryDto } from './dto/check-conflictos-query.dto';
import { FuncionConflictDto } from './dto/funcion-response.dto';
import { AdminMapaAsientosResponseDto } from './dto/admin-mapa-asientos.response.dto';

@ApiTags('admin/funciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/funciones')
export class AdminFuncionesController {
  constructor(private readonly svc: FuncionesService) {}

  @Get('conflictos')
  @ApiOperation({
    summary: 'Verificar conflictos de horario para una sala y función',
  })
  @ApiOkResponse({
    type: FuncionConflictDto,
    isArray: true,
    description: 'Lista de conflictos de horario',
  })
  conflictos(@Query() q: CheckConflictosQueryDto) {
    return this.svc.checkConflictos({
      id_cine: BigInt(q.id_cine),
      id_sala: BigInt(q.id_sala),
      fecha_hora: new Date(q.fecha_hora),
      duracion_min: Number(q.duracion_min),
      ignorar_id: q.ignorar_id ? BigInt(q.ignorar_id) : undefined,
    });
  }

  @Get(':id/asientos')
  @ApiOperation({ summary: 'Mapa de asientos de una función (vista admin)' })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ type: AdminMapaAsientosResponseDto })
  @ApiNotFoundResponse({ description: 'La función no existe' })
  @ApiConflictResponse({
    description: 'Algún tipo de asiento no tiene precio configurado',
  })
  getMapaAsientos(
    @Param('id') id: string,
  ): Promise<AdminMapaAsientosResponseDto> {
    return this.svc.getMapaAsientosAdmin(BigInt(id));
  }
}

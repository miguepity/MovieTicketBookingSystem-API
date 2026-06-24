import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FuncionesService } from './funciones.service';
import { CheckConflictosQueryDto } from './dto/check-conflictos-query.dto';

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
  conflictos(@Query() q: CheckConflictosQueryDto) {
    return this.svc.checkConflictos({
      id_cine: BigInt(q.id_cine),
      id_sala: BigInt(q.id_sala),
      fecha_hora: new Date(q.fecha_hora),
      duracion_min: Number(q.duracion_min),
      ignorar_id: q.ignorar_id ? BigInt(q.ignorar_id) : undefined,
    });
  }
}

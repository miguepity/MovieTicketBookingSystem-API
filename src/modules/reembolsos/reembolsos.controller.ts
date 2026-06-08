import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';
import { ReembolsosService } from './reembolsos.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Reembolsos')
@Controller('reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Post(':id/procesar-efectivo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('taquillero')
  @ApiBearerAuth()
  @ApiForbiddenResponse({
    description: 'Solo el rol taquillero puede procesar reembolsos en efectivo',
  })
  procesarEfectivo(@Param('id') id: string) {
    return this.reembolsosService.procesarEfectivo(id);
  }
}

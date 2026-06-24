import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CalificacionesService } from './calificaciones.service';
import { CalificarDto } from './dto/calificar.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Calificaciones')
@Controller('peliculas/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalificacionesController {
  constructor(private readonly calificacionesService: CalificacionesService) {}

  @Get('calificacion-mia')
  @ApiOperation({ summary: 'Obtener mi calificación para una película' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiOkResponse({
    description: 'Calificación encontrada',
    schema: { example: { puntuacion: 4 } },
  })
  @ApiNotFoundResponse({ description: 'No has calificado esta película' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  obtenerMia(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.calificacionesService.obtenerMia(
      BigInt(id),
      BigInt(user.userId),
    );
  }

  @Patch('calificacion')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Calificar una película (requiere haber asistido a una función)',
  })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiOkResponse({
    description: 'Calificación guardada',
    schema: {
      example: { puntuacion: 4, rating_promedio: 4.3, rating_count: 10 },
    },
  })
  @ApiForbiddenResponse({
    description: 'No has asistido a una función de esta película',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  calificar(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CalificarDto,
  ) {
    return this.calificacionesService.calificar(
      BigInt(id),
      BigInt(user.userId),
      dto.puntuacion,
    );
  }

  @Delete('calificacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'Borrar mi calificación de una película' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiOkResponse({
    description: 'Calificación borrada',
    schema: { example: { rating_promedio: 4.2, rating_count: 9 } },
  })
  @ApiNotFoundResponse({
    description: 'No tienes calificación para esta película',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  borrar(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.calificacionesService.borrar(BigInt(id), BigInt(user.userId));
  }
}

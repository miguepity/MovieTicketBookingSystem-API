import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Request,
} from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { BloquearAsientoDto } from './dto/bloquear-asiento.dto';
import { LiberarAsientoDto } from './dto/liberar-asiento.dto';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva función' })
  @ApiResponse({
    status: 201,
    description: 'Función creada exitosamente',
    schema: {
      example: {
        id: '1',
        id_pelicula: '1',
        id_sala: '1',
        fecha_hora: '2026-06-07T18:00:00Z',
        estado: 'active',
      },
    },
  })
  async create(@Body() createFuncioneDto: CreateFuncioneDto) {
    const newFuncion = await this.funcionesService.create(createFuncioneDto);
    return {
      ...newFuncion,
      id: newFuncion.id.toString(),
      id_sala: newFuncion.id_sala.toString(),
      id_pelicula: newFuncion.id_pelicula.toString(),
    };
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela una función' })
  @ApiResponse({
    status: 200,
    description: 'Función cancelada exitosamente',
  })
  async cancel(@Param('id') id: string) {
    return await this.funcionesService.cancel(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar una funcion' })
  @ApiResponse({
    status: 200,
    description: 'Función actualizada exitosamente',
    schema: {
      example: {
        id: '1',
        id_pelicula: '1',
        id_sala: '1',
        fecha_hora: '2026-06-07T18:00:00Z',
        estado: 'active',
      },
    },
  })
  async edit(@Param('id') id: string, @Body() dto: UpdateFuncioneDto) {
    const funcion = await this.funcionesService.edit(id, dto);
    return {
      ...funcion,
      id: funcion.id.toString(),
      id_sala: funcion.id_sala.toString(),
      id_pelicula: funcion.id_pelicula.toString(),
    };
  }

  @Get('/:id/asientos')
  @ApiOperation({
    summary: 'Estado actual de todos los asientos de una función',
    description:
      'Retorna el mapa completo de asientos agrupado por fila. Cada asiento incluye su estado, bloqueado_hasta e id_usuario (null si no está bloqueado, o el ID del usuario que lo bloqueó).',
  })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  @ApiResponse({
    status: 200,
    description: 'Mapa de asientos agrupado por fila',
  })
  @ApiResponse({ status: 404, description: 'Función no encontrada' })
  getAsientos(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.getAsientos(id);
  }

  @Get('/:id/asientos/mis-bloqueos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Obtener los asientos bloqueados por el usuario autenticado en una función',
    description: [
      '## Patrón de referencia: verificación de propiedad vía JWT',
      '',
      'Este endpoint muestra cómo implementar un endpoint que **filtra recursos por el usuario autenticado** extraído del token JWT.',
      'Sirve como template para otros módulos que necesiten:',
      '',
      '- `@UseGuards(AuthGuard)` — valida el token Bearer',
      '- `@Request() req` — accede a `req.user.userId` inyectado por el guard',
      '- `BigInt(req.user.userId)` — convierte el ID para queries con Prisma',
      '- Filtrar resultados con `where: { id_usuario }` en el servicio',
      '',
      '---',
      '',
      'Retorna la lista de asientos que el usuario tiene bloqueados actualmente en esta función.',
      'Útil para que el frontend muestre qué asientos ya seleccionó el usuario y puedan liberarse manualmente.',
    ].join('\n'),
  })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  @ApiResponse({
    status: 200,
    description: 'Lista de asientos bloqueados por el usuario',
    schema: {
      example: [
        {
          id: '45',
          id_asiento: '12',
          codigo: 'A5',
          fila: 'A',
          columna: 5,
          tipo: 'regular',
          bloqueado_hasta: '2026-06-28T18:05:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado: token inválido o ausente',
  })
  async misBloqueos(@Param('id') funcion_id: string, @Request() req: any) {
    const userId = BigInt(req.user.userId);
    return await this.funcionesService.misBloqueos(BigInt(funcion_id), userId);
  }

  @Post('/:id/asientos/bloquear')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bloquear un asiento de una función',
    description:
      'Bloquea un asiento para una función específica. El asiento queda asociado al usuario autenticado por el tiempo configurado en SEAT_BLOCK_SECONDS.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asiento bloqueado exitosamente',
    schema: {
      example: {
        id: '1',
        id_asiento: '1',
        id_funcion: '1',
        estado: 'bloqueado',
        id_usuario: '1',
        bloqueado_hasta: '2026-06-28T18:03:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 409, description: 'El asiento ya está bloqueado' })
  async bloquearAsientos(
    @Body() body: BloquearAsientoDto,
    @Param('id') funcion_id: string,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.userId);
    const asiento = await this.funcionesService.bloquearAsientos(
      BigInt(body.id_asiento),
      BigInt(funcion_id),
      userId,
    );

    return {
      ...asiento,
      id: asiento.id.toString(),
      id_asiento: asiento.id_asiento.toString(),
      id_funcion: asiento.id_funcion.toString(),
      id_usuario: asiento.id_usuario?.toString() ?? null,
    };
  }

  @Post('/:id/asientos/liberar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Liberar un asiento bloqueado',
    description:
      'Libera un asiento previamente bloqueado. Solo el mismo usuario que lo bloqueó puede liberarlo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asiento liberado exitosamente',
    schema: {
      example: { message: 'Asiento liberado exitosamente' },
    },
  })
  @ApiResponse({ status: 400, description: 'El asiento no está bloqueado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'No puedes liberar un asiento bloqueado por otro usuario',
  })
  @ApiResponse({ status: 404, description: 'Asiento no encontrado' })
  async liberarAsiento(
    @Body() body: LiberarAsientoDto,
    @Param('id') funcion_id: string,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.userId);
    return await this.funcionesService.liberarAsiento(
      BigInt(body.id_asiento),
      BigInt(funcion_id),
      userId,
    );
  }

  @Get(':peliculaId/cines/:cineId/funciones')
  @ApiOperation({
    summary: 'Obtener funciones disponibles de una película por cine',
    description:
      'Retorna todas las funciones activas de una película en un cine específico con información de disponibilidad de asientos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de funciones disponibles con disponibilidad de asientos',
    schema: {
      example: [
        {
          id: '1',
          fecha_hora: '2026-06-15T18:00:00Z',
          sala: {
            id: '1',
            nombre: 'Sala 1',
            filas: 10,
            columnas: 15,
          },
          disponibilidad: {
            total: 150,
            disponibles: 120,
            ocupados: 30,
            porcentaje_disponibilidad: 80,
          },
        },
        {
          id: '2',
          fecha_hora: '2026-06-15T20:00:00Z',
          sala: {
            id: '2',
            nombre: 'Sala 2',
            filas: 12,
            columnas: 18,
          },
          disponibilidad: {
            total: 216,
            disponibles: 50,
            ocupados: 166,
            porcentaje_disponibilidad: 23,
          },
        },
      ],
    },
  })
  @ApiParam({ name: 'peliculaId', description: 'ID de la película' })
  @ApiParam({ name: 'cineId', description: 'ID del cine' })
  @ApiResponse({
    status: 404,
    description: 'Película o cine no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getFuncionesPorCine(
    @Param('peliculaId', ParseIntPipe) peliculaId: number,
    @Param('cineId', ParseIntPipe) cineId: number,
  ) {
    return this.funcionesService.getFuncionesPorCine(
      peliculaId.toString(),
      cineId.toString(),
    );
  }
}

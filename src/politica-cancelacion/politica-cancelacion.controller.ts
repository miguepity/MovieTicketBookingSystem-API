import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PoliticaCancelacionService } from './politica-cancelacion.service';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticaCancelacionDto } from './dto/update-politica-cancelacion.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Política de Cancelación')
@Controller('politica-cancelacion')
export class PoliticaCancelacionController {
  constructor(
    private readonly politicaCancelacionService: PoliticaCancelacionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reglas de política de cancelación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de políticas de cancelación',
    schema: {
      example: [
        {
          id: '1',
          horas_antes_minimo: 24,
          horas_antes_maximo: 48,
          porcentaje_reembolso: '100.00',
        },
        {
          id: '2',
          horas_antes_minimo: 12,
          horas_antes_maximo: 24,
          porcentaje_reembolso: '50.00',
        },
      ],
    },
  })
  async findAll() {
    const politicas = await this.politicaCancelacionService.findAll();
    return politicas.map((politica) => ({
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: politica.porcentaje_reembolso.toString(),
    }));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una regla de política de cancelación por ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación encontrada',
    schema: {
      example: {
        id: '1',
        horas_antes_minimo: 24,
        horas_antes_maximo: 48,
        porcentaje_reembolso: '100.00',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const politica = await this.politicaCancelacionService.findById(id);
    return {
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: politica.porcentaje_reembolso.toString(),
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva regla de política de cancelación' })
  @ApiResponse({
    status: 201,
    description: 'Política de cancelación creada exitosamente',
    schema: {
      example: {
        id: '1',
        horas_antes_minimo: 24,
        horas_antes_maximo: 48,
        porcentaje_reembolso: '100.00',
      },
    },
  })
  async create(
    @Body() createPoliticaCancelacionDto: CreatePoliticaCancelacionDto,
  ) {
    const politica = await this.politicaCancelacionService.create(
      createPoliticaCancelacionDto,
    );
    return {
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: politica.porcentaje_reembolso.toString(),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una regla de política de cancelación',
  })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación actualizada exitosamente',
    schema: {
      example: {
        id: '1',
        horas_antes_minimo: 24,
        horas_antes_maximo: 48,
        porcentaje_reembolso: '100.00',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePoliticaCancelacionDto: UpdatePoliticaCancelacionDto,
  ) {
    const politica = await this.politicaCancelacionService.update(
      id,
      updatePoliticaCancelacionDto,
    );
    return {
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: politica.porcentaje_reembolso.toString(),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una regla de política de cancelación' })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const politica = await this.politicaCancelacionService.delete(id);
    return {
      ...politica,
      id: politica.id.toString(),
      porcentaje_reembolso: politica.porcentaje_reembolso.toString(),
    };
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PoliticasCancelacionService } from './politicas.cancelacion.service';
import { PoliticasBodyDto } from './dto/politicas.cancelacion.body.dto';
import { UpdatePoliticasDto } from './dto/update-politicas.dto';

@ApiTags('Políticas de Cancelación')
@Controller('politica-cancelacion')
export class PoliticasCancelacionController {
  constructor(private readonly politicasService: PoliticasCancelacionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las políticas de cancelación' })
  getPoliticas() {
    return this.politicasService.getPoliticas();
  }

  @Post()
  @ApiOperation({ summary: 'Crear una política de cancelación' })
  createPolitica(@Body() dto: PoliticasBodyDto) {
    return this.politicasService.createPoliticas(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una política de cancelación completa' })
  @ApiParam({ name: 'id', description: 'ID de la política' })
  editPolitica(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PoliticasBodyDto,
  ) {
    return this.politicasService.updatePoliticas({ id }, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial de una política' })
  @ApiParam({ name: 'id', description: 'ID de la política' })
  updatePolitica(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePoliticasDto,
  ) {
    return this.politicasService.updatePoliticas({ id }, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una política de cancelación' })
  @ApiParam({ name: 'id', description: 'ID de la política' })
  removePolitica(@Param('id', ParseIntPipe) id: number) {
    return this.politicasService.removePoliticas({ id });
  }
}

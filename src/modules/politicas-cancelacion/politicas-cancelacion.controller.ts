import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliticasCancelacionService } from './politicas-cancelacion.service';
import { UpdatePoliticasCancelacionDto } from './dto/update-politicas-cancelacion.dto';
import { PoliticasCancelacionPageResponseDto } from './dto/politicas-cancelacion-page.response.dto';
import { ListPoliticasCancelacionQueryDto } from './dto/list-politicas-cancelacion-query.dto';

@ApiTags('Politicas de Cancelacion')
@Controller('politicas-cancelacion')
export class PoliticasCancelacionController {
  constructor(
    private readonly politicasCancelacionService: PoliticasCancelacionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar Politicas de Cancelacion' })
  @ApiOkResponse({ type: PoliticasCancelacionPageResponseDto })
  findAll(
    @Query() query: ListPoliticasCancelacionQueryDto,
  ): Promise<PoliticasCancelacionPageResponseDto> {
    return this.politicasCancelacionService.findAll(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una política de cancelación' })
  @ApiOkResponse({
    description: 'Política de cancelación actualizada exitosamente',
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Política de cancelación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updatePoliticasCancelacionDto: UpdatePoliticasCancelacionDto,
  ) {
    return this.politicasCancelacionService.update(
      id,
      updatePoliticasCancelacionDto,
    );
  }
}

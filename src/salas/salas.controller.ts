import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { AuthGuard } from '../auth/auth.guard';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('Salas')
@Controller('cines')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post(':id/salas')
  @UseGuards(AuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una sala en un cine con generacion automatica de asientos',
  })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  crear(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSalaDto) {
    return this.salasService.crearSala(id, dto);
  }
}

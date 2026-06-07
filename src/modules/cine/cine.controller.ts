import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CineService } from './cine.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cines')
@Controller('cine')
export class CineController {
  constructor(private readonly cineService: CineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un cine' })
  @ApiCreatedResponse({ type: CreateCineDto })
  @ApiBadRequestResponse({
    description: 'Ciudad inexistente o payload invalido',
  })
  @ApiConflictResponse({ description: 'Miembro duplicado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createCineDto: CreateCineDto,
  ): Promise<CineCreatedResponseDto> {
    return this.cineService.create(createCineDto);
  }

  @Get()
  findAll() {
    return this.cineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cineService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateCineDto: UpdateCineDto) {
    return this.cineService.update(+id, updateCineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.cineService.remove(+id);
  }
}

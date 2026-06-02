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
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CineService } from './cine.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { ListCinesQueryDto} from './dto/list-cines-query.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { CinesPageResponseDto } from './dto/cines-page.response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

@ApiTags('Cines')
@Controller('cine')
export class CineController {
  constructor(private readonly cineService: CineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un cine' })
  @ApiCreatedResponse({ type: CreateCineDto })
  @ApiBadRequestResponse({
    description: 'Ciudad inexistente o payload invalido',
  })
  @ApiConflictResponse({ description: 'Miembro duplicado' })
  create(
    @Body() createCineDto: CreateCineDto,
  ):Promise<CineCreatedResponseDto> { 
    return this.cineService.create(createCineDto);
  }

  @ApiOperation({ summary: 'Listar Cines' })
  @ApiOkResponse({ type: CinesPageResponseDto })
  @Get()
  findAll(@Query() query: ListCinesQueryDto): Promise<CinesPageResponseDto> {
    return this.cineService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCineDto: UpdateCineDto) {
    return this.cineService.update(+id, updateCineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cineService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Put, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CuponesService } from './cupon.service';
import { CreateCuponDto } from './create-cupon.dto';
import { UpdateCuponDto } from './update-cupon.dto';
import { ValidarCuponDto } from './validar-cupon.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cupones de Descuento')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post('validar')
  @ApiOperation({ summary: 'Validar un código de cupón activo y vigente ' })
  @ApiResponse({ status: 200, description: 'Cupón válido. Retorna el tipo y valor del beneficio.' })
  @ApiResponse({ status: 400, description: 'Cupón vencido, inactivo o al límite de uso.' })
  @ApiResponse({ status: 404, description: 'El código del cupón no existe.' })
  validar(@Body() validarCuponDto: ValidarCuponDto) {
    return this.cuponesService.validar(validarCuponDto);
  }

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo cupón con código único' })
  @ApiResponse({ status: 201, description: 'Cupón creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'El código del cupón ya existe.' })
  create(@Body() createCuponDto: CreateCuponDto, @Req() req: any) {
    return this.cuponesService.create(createCuponDto, req.user.id);
  }

  @Get()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todos los cupones o filtrar por código' })
  @ApiResponse({ status: 200, description: 'Lista de cupones obtenida con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' }) 
  @ApiResponse({ status: 404, description: 'No se encontraron cupones.' })
  findAll(@Query('codigo') codigo?: string) {
    return this.cuponesService.findAll(codigo);
  }

  @Get(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener un cupón específico por su ID '})
  @ApiResponse({ status: 200, description: 'Cupón encontrado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cuponesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar la información de un cupón ' })
  @ApiResponse({ status: 200, description: 'Cupón actualizado con éxito.' }) 
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCuponDto: UpdateCuponDto, @Req() req: any) {
    return this.cuponesService.update(id, updateCuponDto, req.user.id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cambiar el estado de un cupón (Toggle Activo / Inactivo)' })
  @ApiResponse({ status: 200, description: 'Estado del cupón actualizado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado.' })
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cuponesService.toggleStatus(id, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar cupón ' })
  @ApiResponse({ status: 200, description: 'Cupón eliminado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cuponesService.remove(id, req.user.id);
  }
}
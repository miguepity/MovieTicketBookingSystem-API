import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo cupón' })
  @ApiResponse({
    status: 201,
    description: 'Cupón creado exitosamente',
    schema: {
      example: {
        id: '1',
        codigo: 'DESC20',
        tipo: 'descuento',
        valor: '20.50',
        fecha_expiracion: '2025-12-31',
        usos_maximos: 100,
        usos_actuales: 0,
        activo: true,
        created_at: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'El código del cupón ya existe',
  })
  async create(@Body() createCuponDto: CreateCuponDto) {
    const cupon = await this.cuponesService.create(createCuponDto);
    return {
      ...cupon,
      id: cupon.id.toString(),
      valor: cupon.valor.toString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cupones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cupones',
    schema: {
      example: [
        {
          id: '1',
          codigo: 'DESC20',
          tipo: 'descuento',
          valor: '20.50',
          fecha_expiracion: '2025-12-31',
          usos_maximos: 100,
          usos_actuales: 0,
          activo: true,
          created_at: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  async findAll() {
    const cupones = await this.cuponesService.findAll();
    return cupones.map((cupon) => ({
      ...cupon,
      id: cupon.id.toString(),
      valor: cupon.valor.toString(),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cupón por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cupón encontrado',
    schema: {
      example: {
        id: '1',
        codigo: 'DESC20',
        tipo: 'descuento',
        valor: '20.50',
        fecha_expiracion: '2025-12-31',
        usos_maximos: 100,
        usos_actuales: 0,
        activo: true,
        created_at: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cupón no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const cupon = await this.cuponesService.findById(id);
    return {
      ...cupon,
      id: cupon.id.toString(),
      valor: cupon.valor.toString(),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un cupón por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cupón actualizado exitosamente',
    schema: {
      example: {
        id: '1',
        codigo: 'DESC20',
        tipo: 'descuento',
        valor: '25.00',
        fecha_expiracion: '2025-12-31',
        usos_maximos: 150,
        usos_actuales: 0,
        activo: true,
        created_at: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cupón no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El código del cupón ya existe',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuponDto: UpdateCuponDto,
  ) {
    const cupon = await this.cuponesService.update(id, updateCuponDto);
    return {
      ...cupon,
      id: cupon.id.toString(),
      valor: cupon.valor.toString(),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un cupón por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cupón eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cupón no encontrado',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const cupon = await this.cuponesService.delete(id);
    return {
      ...cupon,
      id: cupon.id.toString(),
      valor: cupon.valor.toString(),
    };
  }
}

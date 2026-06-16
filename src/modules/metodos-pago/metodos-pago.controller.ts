import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MetodosPagoService } from './metodos-pago.service';
import { CrearMetodoPagoDto } from './dto/crear-metodo-pago.dto';
import { MetodoPagoResponseDto } from './dto/metodo-pago-response.dto';

@ApiTags('MetodosPago')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios/me/metodos-pago')
export class MetodosPagoController {
  constructor(private readonly svc: MetodosPagoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar métodos de pago guardados del usuario' })
  @ApiOkResponse({ type: MetodoPagoResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  list(@CurrentUser() user: CurrentUserPayload): Promise<MetodoPagoResponseDto[]> {
    return this.svc.list(BigInt(user.userId));
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Guardar un nuevo método (tarjeta o efectivo)' })
  @ApiCreatedResponse({ type: MetodoPagoResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'Ya tenés efectivo guardado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CrearMetodoPagoDto,
  ): Promise<MetodoPagoResponseDto> {
    return this.svc.create(BigInt(user.userId), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un método guardado' })
  @ApiNoContentResponse({ description: 'Eliminado' })
  @ApiNotFoundResponse({ description: 'No existe o no es tuyo' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.svc.remove(BigInt(user.userId), BigInt(id));
  }

  @Patch(':id/predeterminada')
  @ApiOperation({ summary: 'Marcar un método como predeterminado' })
  @ApiOkResponse({ type: MetodoPagoResponseDto })
  @ApiNotFoundResponse({ description: 'No existe o no es tuyo' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  setDefault(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<MetodoPagoResponseDto> {
    return this.svc.setDefault(BigInt(user.userId), BigInt(id));
  }
}

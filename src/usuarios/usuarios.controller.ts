import { Controller, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Body, Put, Param, Patch, Post } from '@nestjs/common';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ConfirmarRegistroDto } from './dto/confirmar-registro.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Put(':id')
  async updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateEmailDto: UpdateEmailDto,
  ) {
    return this.usuariosService.updateUserEmail(id, updateEmailDto.newEmail);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.usuariosService.updateStatus(id, updateStatusDto);
  }

  @Post('confirmar-registro')
  confirmarRegistro(@Body() confirmarRegistroDto: ConfirmarRegistroDto) {
    return this.usuariosService.confirmarRegistro(confirmarRegistroDto);
  }
}

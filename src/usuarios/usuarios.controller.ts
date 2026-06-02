import { Controller, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Body, Put, Param } from '@nestjs/common';
import { UpdateEmailDto } from './dto/update-email.dto';

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
}

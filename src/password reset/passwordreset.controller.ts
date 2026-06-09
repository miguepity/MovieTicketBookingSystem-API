import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PasswordResetService } from './passwordreset.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class PasswordResetTokenController {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar enlace de recuperación de contraseña' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.resetPassword(dto);
  }
}

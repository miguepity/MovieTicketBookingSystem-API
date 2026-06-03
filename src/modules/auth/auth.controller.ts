import { Controller, Post, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse } from './entities/auth-response.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y devuelve un token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso.',
    type: AuthResponse,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Crea un nuevo usuario y devuelve un token JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente.',
    type: AuthResponse,
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Solicitar restablecimiento de contraseña',
    description:
      'Genera un token de recuperación y envía un email con el enlace para restablecer la contraseña.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperación enviado (respuesta genérica por seguridad).',
    schema: {
      example: {
        message:
          'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
      },
    },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description:
      'Valida el token de recuperación y actualiza la contraseña del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente.',
    schema: { example: { message: 'Contraseña actualizada exitosamente' } },
  })
  @ApiResponse({ status: 400, description: 'Token inválido, ya usado o expirado.' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Put('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar email',
    description:
      'Actualiza el email del usuario autenticado y devuelve un nuevo token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email actualizado exitosamente.',
    type: AuthResponse,
  })
  @ApiResponse({ status: 409, description: 'El email ya está en uso.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  changeEmail(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangeEmailDto,
  ) {
    return this.authService.changeEmail(user.userId, dto);
  }
}

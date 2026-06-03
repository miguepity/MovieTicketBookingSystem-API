import { Controller, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { AuthResponse } from './entities/auth-response.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y devuelve un token JWT.',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso.', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Crea un nuevo usuario y devuelve un token JWT.',
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.', type: AuthResponse })
  @ApiResponse({ status: 409, description: 'El email ya está registrado.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Put('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar email',
    description: 'Actualiza el email del usuario autenticado y devuelve un nuevo token JWT.',
  })
  @ApiResponse({ status: 200, description: 'Email actualizado exitosamente.', type: AuthResponse })
  @ApiResponse({ status: 409, description: 'El email ya está en uso.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  changeEmail(@Request() req: any, @Body() dto: ChangeEmailDto) {
    return this.authService.changeEmail(req.user.userId, dto);
  }
}

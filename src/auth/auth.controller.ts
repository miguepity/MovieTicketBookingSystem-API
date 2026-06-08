import { Controller, Post, Body, UseGuards} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Autenticación') 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya existe.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso. Devuelve el access_token.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Generar token y enviar correo para recuperar contrasena' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Solicitud recibida. Si el correo existe, se enviaran instrucciones.',
  })
  @ApiResponse({ status: 400, description: 'Email invalido o faltante.' })
  @ApiResponse({ status: 500, description: 'No se pudo enviar el correo de recuperacion.' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contrasena usando el token enviado por correo' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Contrasena restablecida correctamente.' })
  @ApiResponse({ status: 400, description: 'Token invalido, expirado o nueva contrasena invalida.' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Cerrar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token inválido o ausente.' })
  logout() {
    return this.authService.logout();
  }
}

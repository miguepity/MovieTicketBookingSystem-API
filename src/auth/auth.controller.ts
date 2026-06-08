import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return await this.authService.login(email, password);
  }
}

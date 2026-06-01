import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  @ApiOperation({
    description:
      'Endpoint for user registration. Accepts email and password, creates a new user, and returns an access token.',
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            example: {
              access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
      400: {
        description: 'Bad Request - Email already in use or invalid input',
        content: {
          'application/json': {
            example: {
              statusCode: 400,
              message: 'Email already in use',
              error: 'Bad Request',
            },
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            example: {
              statusCode: 500,
              message: 'An error occurred while registering the user',
              error: 'Internal Server Error',
            },
          },
        },
      },
    },
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { email, password } = registerDto;
    return await this.authService.register(email, password);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return await this.authService.login(email, password);
  }
}

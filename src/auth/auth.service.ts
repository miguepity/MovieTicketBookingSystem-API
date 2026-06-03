import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new BadRequestException('Invalid credentials');

    const hashed_password = await bcrypt.compare(password, user.password_hash);

    if (!user || !hashed_password) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.nombre,
      role: user.id_rol.toString(),
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }
}

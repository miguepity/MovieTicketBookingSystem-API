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
    const hashed_password = await bcrypt.hash(password, 10);

    if (!user || user.password_hash !== hashed_password) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, role: user.id_rol };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}

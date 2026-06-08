import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { password, ...rest } = signupDto;
    const SALT_ROUNDS = 10;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.usersService.create({
      ...rest,
      password_hash,
    });

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.nombre,
      role: user.id_rol.toString(),
    };

    // Enviar correo de bienvenida (sin esperar para no bloquear la respuesta)
    void this.mailService.sendEmail(
      user.email,
      '¡Bienvenido a MovieSys!',
      `<h1>Hola ${user.nombre}</h1><p>Gracias por registrarte en MovieSys. ¡Disfruta de las mejores películas!</p>`,
    );

    return {
      message: 'Usuario registrado exitosamente',
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

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

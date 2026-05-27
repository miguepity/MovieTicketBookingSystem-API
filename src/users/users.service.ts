import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findOneByEmail(email: string) {
    return await this.prismaService.usuarios.findUnique({
      where: {
        email,
      },
    });
  }
}

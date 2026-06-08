import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async create(data: {
    nombre: string;
    email: string;
    password_hash: string;
    telefono?: string;
  }) {
    const existingUser = await this.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    return await this.prismaService.usuarios.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password_hash: data.password_hash,
        telefono: data.telefono,
        id_rol: BigInt(2), // Rol 'client' por defecti
        estado: 'active',
      },
    });
  }
}

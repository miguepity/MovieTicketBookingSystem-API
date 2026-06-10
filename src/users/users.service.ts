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

  async update(
    id: number,
    data: { nombre?: string; email?: string; telefono?: string },
  ) {
    const user = await this.prismaService.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new ConflictException('Usuario no encontrado');
    }

    if (data.email && data.email !== user.email) {
      const emailTaken = await this.findOneByEmail(data.email);
      if (emailTaken) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario',
        );
      }
    }

    return await this.prismaService.usuarios.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
      },
    });
  }

  async toggleNotificaciones(id: number, notificaciones_activas: boolean) {
    const user = await this.prismaService.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new ConflictException('Usuario no encontrado');
    }

    return await this.prismaService.usuarios.update({
      where: { id: BigInt(id) },
      data: {
        notificaciones_activas,
      },
    });
  }
}

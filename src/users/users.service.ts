import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchUserDto } from './dto/search-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
      throw new NotFoundException('Usuario no encontrado');
    }

    if (data.email && data.email !== user.email) {
      const emailTaken = await this.findOneByEmail(data.email);
      if (emailTaken) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario',
        );
      }
    }

    const updatedUser = await this.prismaService.usuarios.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
      },
    });

    return updatedUser;
  }

  async updatePassword(id: number, dto: UpdatePasswordDto) {
    const user = await this.prismaService.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const SALT_ROUNDS = 10;
    const password_hash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prismaService.usuarios.update({
      where: { id: BigInt(id) },
      data: { password_hash },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async findAll(dto: SearchUserDto) {
    const where: any = {};

    if (dto.nombre) {
      where.nombre = { contains: dto.nombre, mode: 'insensitive' };
    }
    if (dto.email) {
      where.email = { contains: dto.email, mode: 'insensitive' };
    }
    if (dto.estado) {
      where.estado = dto.estado;
    }
    where.roles = { nombre: 'Cliente' };

    return await this.prismaService.usuarios.findMany({
      where,
      take: Number(dto.resultados),
    });
  }
}

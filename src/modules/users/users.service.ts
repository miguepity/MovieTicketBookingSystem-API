import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePassword(
    id: string,
    requesterId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (id !== requesterId) {
      throw new ForbiddenException('No puedes modificar la contraseña de otro usuario');
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValida = await bcrypt.compare(
      dto.currentPassword,
      usuario.password_hash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const password_hash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.usuarios.update({
      where: { id: usuario.id },
      data: { password_hash },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async updateStatus(
    id: string,
    auditorId: string,
    dto: ChangeStatusDto,
  ): Promise<{ message: string }> {
    if (id === auditorId) {
      throw new BadRequestException('No puedes cambiar tu propio estado');
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, estado: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.estado === dto.estado) {
      throw new BadRequestException(`El usuario ya tiene el estado "${dto.estado}"`);
    }

    await this.prisma.$transaction([
      this.prisma.usuarios.update({
        where: { id: usuario.id },
        data: { estado: dto.estado },
      }),
      this.prisma.auditLog.create({
        data: {
          id_usuario: usuario.id,
          id_auditor: BigInt(auditorId),
          accion: 'CAMBIO_ESTADO',
          detalle: `Estado cambiado de "${usuario.estado}" a "${dto.estado}"`,
        },
      }),
    ]);

    return { message: `Estado del usuario actualizado a "${dto.estado}"` };
  }

  async toggleNotificaciones(
    id: string,
    requesterId: string,
  ): Promise<{ notificaciones_activas: boolean }> {
    if (id !== requesterId) {
      throw new ForbiddenException(
        'No puedes modificar las notificaciones de otro usuario',
      );
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, notificaciones_activas: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const actualizado = await this.prisma.usuarios.update({
      where: { id: usuario.id },
      data: { notificaciones_activas: !usuario.notificaciones_activas },
      select: { notificaciones_activas: true },
    });

    return { notificaciones_activas: actualizado.notificaciones_activas };
  }

  async findAll(query: QueryUsersDto) {
    const { search, nombre, email, estado, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(nombre && { nombre: { contains: nombre, mode: 'insensitive' as const } }),
      ...(email && { email: { contains: email, mode: 'insensitive' as const } }),
      ...(estado && { estado }),
    };

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuarios.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { roles: true },
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: usuarios.map((u) => ({
        id: u.id.toString(),
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        estado: u.estado,
        id_rol: u.id_rol.toString(),
        rol: u.roles.nombre,
        notificaciones_activas: u.notificaciones_activas,
        created_at: u.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

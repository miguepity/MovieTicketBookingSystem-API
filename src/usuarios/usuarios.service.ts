import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClientesFilterDto } from './dto/clientes-filter.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    if (dto.email && dto.email !== usuario.email) {
      const emailExistente = await this.prisma.usuarios.findUnique({
        where: { email: dto.email },
      });

      if (emailExistente) {
        throw new BadRequestException('El email ya está en uso por otro usuario');
      }
    }

    const actualizado = await this.prisma.usuarios.update({
      where: { id: BigInt(userId) },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono }),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        notificaciones_activas: true,
        estado: true,
      },
    });

    return { ...actualizado, id: actualizado.id.toString() };
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Se actualiza mapeando al campo 'estado' de la tabla usuarios
    const usuarioActualizado = await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { estado: dto.status },
    });

    return {
      message: 'Estado del usuario actualizado exitosamente.',
      id: Number(usuarioActualizado.id),
      status: usuarioActualizado.estado,
    };
  }

  async updatePassword(id: number, dto: UpdatePasswordDto) {
    // 1. Buscar al usuario por su ID usando BigInt
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // 2. Verificar si la contraseña actual coincide con el hash
    const isMatch = await bcrypt.compare(
      dto.oldPassword,
      usuario.password_hash,
    );
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    // 3. Hashear la nueva contraseña con el factor de 10
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    // 4. Actualizar el registro en la base de datos
    await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { password_hash: newPasswordHash },
    });

    return { message: 'Contraseña actualizada exitosamente.' };
  }

  async findAllClientes(filtro: ClientesFilterDto = {} as ClientesFilterDto) {
    const page = Number(filtro.page) || 1;
    const limit = Number(filtro.limit) || 10;

    const where = {
      roles: { nombre: 'cliente' },
      ...(filtro.estado && { estado: filtro.estado }),
      ...(filtro.q && {
        OR: [
          { nombre: { contains: filtro.q, mode: 'insensitive' as const } },
          { email: { contains: filtro.q, mode: 'insensitive' as const } },
          { telefono: { contains: filtro.q, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [clientes, total] = await this.prisma.$transaction([
      this.prisma.usuarios.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          estado: true,
          created_at: true,
          roles: { select: { nombre: true } },
          _count: { select: { reservas: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: clientes.map(({ id, _count, ...cliente }) => ({
        ...cliente,
        id: id.toString(),
        reservas_count: _count.reservas,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async searchClientes(q?: string) {
    const clientes = await this.prisma.usuarios.findMany({
      where: {
        roles: { nombre: 'cliente' },
        ...(q && {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { telefono: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        estado: true,
        created_at: true,
        roles: { select: { nombre: true } },
      },
    });

    return clientes.map((cliente) => ({
      ...cliente,
      id: cliente.id.toString(),
    }));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        notificaciones_activas: true,
        estado: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return { ...usuario, id: usuario.id.toString() };
  }

  async toggleNotifications(id: number) {
    const findUsuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });
    if (!findUsuario) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }

    await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { notificaciones_activas: !findUsuario.notificaciones_activas },
    });

    if (findUsuario.notificaciones_activas) {
      return 'Notificaciones desactivadas';
    } else {
      return 'Notificaciones activadas';
    }
  }

  async findClientesSuscritos() {
    const clientes = await this.prisma.usuarios.findMany({
      where: {
        notificaciones_activas: true,
        estado: 'activo',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
    });

    return clientes.map((c) => ({ ...c, id: c.id.toString() }));
  }

  async triggerCancelacionUsuario(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: { reservas: { where: { estado: 'confirmada' } } },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Aquí se dispararía la lógica para cancelar sus reservas activas
    // y notificar al usuario. Por ahora, marcamos como un trigger exitoso.

    return {
      message: `Proceso de cancelación iniciado para el usuario ${usuario.nombre}`,
      reservas_a_cancelar: usuario.reservas.length,
    };
  }

  async deleteUser(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuarios.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Usuario eliminado exitosamente.' };
  }

  async deleteAllUsers() {
    await this.prisma.usuarios.deleteMany({});
    return { message: 'Todos los usuarios han sido eliminados.' };
  }
}

import { Injectable, NotFoundException,BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';

const USER_SELECT = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  estado: true,
  notificaciones_activas: true,
  created_at: true,
  updated_at: true,
  roles: {
    select: {
      id: true,
      nombre: true,
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeUser(usuario: any) {
      return {
        ...usuario,
        id: Number(usuario.id),
        roles: usuario.roles
          ? { id: Number(usuario.roles.id), nombre: usuario.roles.nombre }
          : usuario.roles,
      };
    }

  async create(createUserDto: CreateUserDto, requesterRole?: string) {
        const { name, email, password, phone } = createUserDto;
        let { roleId } = createUserDto;

        // Un recepcionista solo puede crear clientes, sin importar el rol que envíe.
        if (requesterRole === 'RECEPCIONISTA') {
          const clienteRole = await this.prisma.roles.findUnique({
            where: { nombre: 'CLIENTE' },
          });
          if (!clienteRole) {
            throw new NotFoundException('Rol CLIENTE no encontrado.');
          }
          roleId = Number(clienteRole.id);
        }

        const emailEnUso = await this.prisma.usuarios.findUnique({
          where: { email },
        });

        if (emailEnUso) {
          throw new ConflictException('El correo electrónico ya se encuentra registrado.');
        }

        const rol = await this.prisma.roles.findUnique({
          where: { id: BigInt(roleId) },
        });
  
        if (!rol) {
          throw new NotFoundException(`Rol con ID ${roleId} no encontrado.`);
        }
  
        const passwordHash = await bcrypt.hash(password, 10);
  
        const usuario = await this.prisma.usuarios.create({
          data: {
            nombre: name,
            email,
            password_hash: passwordHash,
            telefono: phone,
            estado: 'ACTIVO',
            notificaciones_activas: false,
            roles: {
              connect: { id: BigInt(roleId) },
            },
          },
          select: USER_SELECT,
        });
  
        return {
          message: 'Usuario creado exitosamente.',
          user: this.serializeUser(usuario),
        };
      }

  async buscarClientes(query: QueryUsuariosDto) {
    const { search } = query;

    const usuarios = await this.prisma.usuarios.findMany({
      where: {
        id_rol: BigInt(2)
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        estado: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      message: 'Clientes encontrados',
      total: usuarios.length,
      data: usuarios.map((u) => ({ ...u, id: Number(u.id) })),
    };
  }

  async listarUsuarios(filtro?: { rolId?: number; search?: string }) {
    const { rolId, search } = filtro || {};

    const usuarios = await this.prisma.usuarios.findMany({
      where: {
        ...(rolId && { id_rol: BigInt(rolId) }),
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        estado: true,
        roles: { select: { nombre: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      message: 'Usuarios encontrados',
      total: usuarios.length,
      data: usuarios.map((u) => ({
        ...u,
        id: Number(u.id),
        rol: u.roles.nombre,
      })),
    };
  }

  async cambiarEstado(id: string, dto: CambiarEstadoDto, auditorId: number) {
    if (BigInt(id) === BigInt(auditorId)) {
      throw new BadRequestException('No puedes modificar tu propio estado.');
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const estadoAnterior = usuario.estado;

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.usuarios.update({
        where: { id: BigInt(id) },
        data: { estado: dto.estado },
      }),
      this.prisma.auditLog.create({
        data: {
          id_usuario: BigInt(id),
          id_auditor: BigInt(auditorId),
          accion: 'CAMBIO_ESTADO',
          detalle: `Estado cambiado de ${estadoAnterior} a ${dto.estado}`,
        },
      }),
    ]);

    return {
      message: 'Estado del usuario actualizado exitosamente',
      data: {
        id: Number(actualizado.id),
        nombre: actualizado.nombre,
        email: actualizado.email,
        estado: actualizado.estado,
      },
    };
  }

  async editarUsuario(id: string, dto: { nombre?: string; email?: string; id_rol?: number }, auditorId: number) {
    if (BigInt(id) === BigInt(auditorId)) {
      throw new BadRequestException('No puedes modificar tu propio perfil.');
    }

    const usuario = await this.prisma.usuarios.findUnique({ where: { id: BigInt(id) } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const actualizado = await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.email && { email: dto.email }),
        ...(dto.id_rol && { id_rol: BigInt(dto.id_rol) }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(id),
        id_auditor: BigInt(auditorId),
        accion: 'USUARIO_EDITADO',
        detalle: `Datos del usuario ${id} actualizados por administrador`,
      },
    });

    const { password_hash, ...dataSinPassword } = actualizado;
    return { message: 'Usuario actualizado', data: dataSinPassword };
  }

  async eliminarUsuario(id: string, auditorId: number) {
    if (BigInt(id) === BigInt(auditorId)) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta.');
    }

    const usuario = await this.prisma.usuarios.findUnique({ where: { id: BigInt(id) } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Validar si tiene reservas activas
    const reservasActivas = await this.prisma.reservas.findFirst({
      where: { 
        id_usuario: BigInt(id),
        estado: { in: ['PENDIENTE_DE_PAGO', 'CONFIRMADA'] }
      }
    });

    if (reservasActivas) {
      throw new ConflictException('No se puede desactivar un usuario con reservas activas.');
    }

    await this.prisma.$transaction([
      this.prisma.usuarios.update({ 
        where: { id: BigInt(id) },
        data: { estado: 'INACTIVO' }
      }),
      this.prisma.auditLog.create({
        data: {
          id_usuario: BigInt(id),
          id_auditor: BigInt(auditorId),
          accion: 'USUARIO_DESACTIVADO',
          detalle: `Usuario ${id} desactivado por administrador`,
        },
      }),
    ]);

    return { message: 'Usuario desactivado correctamente' };
  }
}

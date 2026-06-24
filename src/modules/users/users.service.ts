import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotUsuario } from '../audit-log/snapshots/usuario.snapshot';
import { QueryUsersDto } from './dto/query-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { ListClientesQueryDto } from './dto/list-clientes-query.dto';
import { ListStaffQueryDto } from './dto/list-staff-query.dto';
import { CrearStaffDto } from './dto/crear-staff.dto';
import { ActualizarStaffDto } from './dto/actualizar-staff.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async updatePassword(
    id: string,
    requesterId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (id !== requesterId) {
      throw new ForbiddenException(
        'No puedes modificar la contraseña de otro usuario',
      );
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

    await this.auditLog.registrar({
      id_usuario: usuario.id,
      id_auditor: usuario.id,
      accion: 'USUARIO_EDITAR_PASSWORD',
      entidad: 'Usuario',
      entidad_id: usuario.id,
      detalle: `Password actualizado para usuario ${id}`,
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async updateStatus(
    id: string,
    auditorId: string,
    dto: ChangeStatusDto,
  ): Promise<{ message: string }> {
    const auditor = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(auditorId) },
      include: { roles: { select: { nombre: true } } },
    });
    if (!auditor || auditor.roles.nombre !== 'admin') {
      throw new ForbiddenException({
        code: 'ROL_NO_AUTORIZADO',
        message: 'Solo el rol admin puede cambiar el estado de un usuario',
      });
    }

    if (id === auditorId) {
      throw new BadRequestException('No puedes cambiar tu propio estado');
    }

    const prev = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: { roles: true },
    });

    if (!prev) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (prev.estado === dto.estado) {
      throw new BadRequestException(
        `El usuario ya tiene el estado "${dto.estado}"`,
      );
    }

    await this.prisma.usuarios.update({
      where: { id: prev.id },
      data: { estado: dto.estado },
    });

    const updated = await this.prisma.usuarios.findUnique({
      where: { id: prev.id },
      include: { roles: true },
    });

    await this.auditLog.registrar({
      id_usuario: prev.id,
      id_auditor: BigInt(auditorId),
      accion: 'USUARIO_TOGGLE_ESTADO',
      entidad: 'Usuario',
      entidad_id: prev.id,
      detalle: `Estado cambiado de "${prev.estado}" a "${dto.estado}"`,
      valor_anterior: snapshotUsuario(prev),
      valor_nuevo: snapshotUsuario(updated!),
    });

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

    const prev = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: { roles: true },
    });

    if (!prev) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuarios.update({
      where: { id: prev.id },
      data: { notificaciones_activas: !prev.notificaciones_activas },
    });

    const updated = await this.prisma.usuarios.findUnique({
      where: { id: prev.id },
      include: { roles: true },
    });

    await this.auditLog.registrar({
      id_usuario: prev.id,
      id_auditor: prev.id,
      accion: 'USUARIO_TOGGLE_NOTIFICACIONES',
      entidad: 'Usuario',
      entidad_id: prev.id,
      valor_anterior: snapshotUsuario(prev),
      valor_nuevo: snapshotUsuario(updated!),
    });

    return { notificaciones_activas: updated!.notificaciones_activas };
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
      ...(nombre && {
        nombre: { contains: nombre, mode: 'insensitive' as const },
      }),
      ...(email && {
        email: { contains: email, mode: 'insensitive' as const },
      }),
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

  async findClientesPaginated(q: ListClientesQueryDto) {
    const where: any = { roles: { is: { nombre: 'cliente' } } };
    if (q.estado) where.estado = q.estado;
    if (q.q) {
      where.OR = [
        { nombre: { contains: q.q, mode: 'insensitive' } },
        { email: { contains: q.q, mode: 'insensitive' } },
        { telefono: { contains: q.q } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { reservas: true } } },
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id.toString(),
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        estado: u.estado,
        notificaciones_activas: u.notificaciones_activas,
        num_reservas: u._count.reservas,
        created_at: u.created_at,
      })),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async findClienteById(id: bigint) {
    const cliente = await this.prisma.usuarios.findFirst({
      where: {
        id,
        roles: { is: { nombre: 'cliente' } },
      },
      include: {
        roles: { select: { nombre: true } },
        _count: { select: { reservas: true } },
        reservas: {
          take: 10,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            numero_reserva: true,
            estado: true,
            created_at: true,
            funciones: {
              select: {
                fecha_hora: true,
                peliculas: { select: { titulo: true } },
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return {
      id: cliente.id.toString(),
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      estado: cliente.estado,
      notificaciones_activas: cliente.notificaciones_activas,
      num_reservas: cliente._count.reservas,
      created_at: cliente.created_at,
      reservas: cliente.reservas.map((r) => ({
        id: r.id.toString(),
        numero_reserva: r.numero_reserva,
        estado: r.estado,
        created_at: r.created_at,
        pelicula: r.funciones.peliculas?.titulo ?? null,
        fecha_hora: r.funciones.fecha_hora,
      })),
    };
  }

  async setClienteEstado(
    id: bigint,
    estado: 'activo' | 'bloqueado',
    auditorId: string,
  ) {
    const prev = await this.prisma.usuarios.findFirst({
      where: { id, roles: { is: { nombre: 'cliente' } } },
      include: { roles: true },
    });

    if (!prev) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const updated = await this.prisma.usuarios.update({
      where: { id },
      data: { estado },
      include: { roles: true, _count: { select: { reservas: true } } },
    });

    await this.auditLog.registrar({
      id_usuario: id,
      id_auditor: BigInt(auditorId),
      accion: 'CLIENTE_TOGGLE_ESTADO',
      entidad: 'clientes',
      entidad_id: id,
      detalle: `Estado cambiado de "${prev.estado}" a "${estado}"`,
      valor_anterior: snapshotUsuario(prev),
      valor_nuevo: snapshotUsuario(updated),
    });

    return {
      id: updated.id.toString(),
      nombre: updated.nombre,
      email: updated.email,
      telefono: updated.telefono,
      estado: updated.estado,
      notificaciones_activas: updated.notificaciones_activas,
      num_reservas: updated._count.reservas,
      created_at: updated.created_at,
    };
  }

  // ─── Staff helpers ───────────────────────────────────────────────────────────

  private generarTempPassword(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  private toStaffView(u: {
    id: bigint;
    nombre: string;
    email: string;
    estado: string;
    ultimo_acceso: Date | null;
    created_at: Date;
  }) {
    return {
      id: u.id.toString(),
      nombre: u.nombre,
      email: u.email,
      estado: u.estado,
      ultimo_acceso: u.ultimo_acceso,
      created_at: u.created_at,
    };
  }

  // ─── Staff CRUD ──────────────────────────────────────────────────────────────

  async findStaffPaginated(q: ListStaffQueryDto) {
    const where: any = { roles: { is: { nombre: 'admin' } } };
    if (q.estado) where.estado = q.estado;
    if (q.q) {
      where.OR = [
        { nombre: { contains: q.q, mode: 'insensitive' } },
        { email: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: users.map((u) => this.toStaffView(u)),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async crearStaff(dto: CrearStaffDto, auditorId: string) {
    const role = await this.prisma.roles.findFirst({
      where: { nombre: 'admin' },
    });
    if (!role) throw new NotFoundException('Rol admin no encontrado');

    const usedPassword = dto.password ?? this.generarTempPassword();
    const isTemp = !dto.password;
    const hash = await bcrypt.hash(usedPassword, 10);

    try {
      const user = await this.prisma.usuarios.create({
        data: {
          nombre: dto.nombre,
          email: dto.email,
          password_hash: hash,
          id_rol: role.id,
          estado: 'activo',
          password_temporal: isTemp,
        },
      });

      await this.auditLog.registrar({
        id_usuario: user.id,
        id_auditor: BigInt(auditorId),
        accion: 'STAFF_CREAR',
        entidad: 'staff',
        entidad_id: user.id,
        valor_nuevo: this.toStaffView(user) as any,
      });

      return {
        user: this.toStaffView(user),
        ...(isTemp ? { tempPassword: usedPassword } : {}),
      };
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Email ya existe');
      throw e;
    }
  }

  async actualizarStaff(
    id: bigint,
    dto: ActualizarStaffDto,
    auditorId: string,
  ) {
    const prev = await this.prisma.usuarios.findFirst({
      where: { id, roles: { is: { nombre: 'admin' } } },
    });
    if (!prev) throw new NotFoundException('Staff no encontrado');

    const updated = await this.prisma.usuarios.update({
      where: { id },
      data: dto,
    });

    await this.auditLog.registrar({
      id_usuario: id,
      id_auditor: BigInt(auditorId),
      accion: 'STAFF_ACTUALIZAR',
      entidad: 'staff',
      entidad_id: id,
      valor_anterior: this.toStaffView(prev) as any,
      valor_nuevo: this.toStaffView(updated) as any,
    });

    return this.toStaffView(updated);
  }

  async setStaffEstado(
    id: bigint,
    estado: 'activo' | 'bloqueado',
    auditorId: string,
  ) {
    const prev = await this.prisma.usuarios.findFirst({
      where: { id, roles: { is: { nombre: 'admin' } } },
    });
    if (!prev) throw new NotFoundException('Staff no encontrado');

    const updated = await this.prisma.usuarios.update({
      where: { id },
      data: { estado },
    });

    await this.auditLog.registrar({
      id_usuario: id,
      id_auditor: BigInt(auditorId),
      accion: 'STAFF_TOGGLE_ESTADO',
      entidad: 'staff',
      entidad_id: id,
      detalle: `Estado cambiado de "${prev.estado}" a "${estado}"`,
      valor_anterior: this.toStaffView(prev) as any,
      valor_nuevo: this.toStaffView(updated) as any,
    });

    return this.toStaffView(updated);
  }

  async resetStaffPassword(id: bigint, auditorId: string) {
    const prev = await this.prisma.usuarios.findFirst({
      where: { id, roles: { is: { nombre: 'admin' } } },
    });
    if (!prev) throw new NotFoundException('Staff no encontrado');

    const tempPassword = this.generarTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    await this.prisma.usuarios.update({
      where: { id },
      data: { password_hash: hash, password_temporal: true },
    });

    await this.auditLog.registrar({
      id_usuario: id,
      id_auditor: BigInt(auditorId),
      accion: 'STAFF_RESET_PASSWORD',
      entidad: 'staff',
      entidad_id: id,
    });

    return { tempPassword };
  }

  async updatePerfil(idUsuario: bigint, dto: UpdatePerfilDto) {
    return this.prisma.usuarios.update({
      where: { id: idUsuario },
      data: dto,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        notificaciones_activas: true,
      },
    });
  }

  async findById(idUsuario: bigint) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id: idUsuario },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        notificaciones_activas: true,
        estado: true,
        created_at: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { ...user, id: user.id.toString() };
  }
}

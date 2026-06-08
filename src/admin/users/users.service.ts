import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarClientes(query: QueryUsuariosDto) {
    const { search } = query;

    const usuarios = await this.prisma.usuarios.findMany({
      where: {
        roles: { nombre: 'CLIENTE' },
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
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      message: 'Clientes encontrados',
      total: usuarios.length,
      data: usuarios.map((u) => ({ ...u, id: Number(u.id) })),
    };
  }

  async cambiarEstado(id: string, dto: CambiarEstadoDto, auditorId: number) {
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
}

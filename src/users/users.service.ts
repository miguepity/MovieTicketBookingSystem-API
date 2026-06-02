import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsersDto) {
    const { nombre, email, estado, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
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

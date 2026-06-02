import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsuariosDto) {
    const { nombre, email, estado, page = '1', limit = '10' } = query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(nombre && {
        nombre: { contains: nombre, mode: 'insensitive' as const },
      }),
      ...(email && {
        email: { contains: email, mode: 'insensitive' as const },
      }),
      ...(estado && { estado }),
    };

    const [usuarios, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        skip,
        take: limitNum,
        select: {
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
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: usuarios,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

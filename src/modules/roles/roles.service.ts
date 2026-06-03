import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(nombre?: string): Promise<Rol[]> {
    const trimmed = nombre?.trim();
    return this.prisma.roles.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Rol> {
    const rolId = this.parseId(id);
    const rol = await this.prisma.roles.findUnique({
      where: { id: rolId },
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    await this.assertNombreDisponible(createRolDto.nombre);
    return this.prisma.roles.create({
      data: createRolDto,
    });
  }

  async update(id: string, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rolId = this.parseId(id);
    await this.assertRolExists(rolId);

    if (updateRolDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateRolDto.nombre, rolId);
    }

    return this.prisma.roles.update({
      where: { id: rolId },
      data: updateRolDto,
    });
  }

  async remove(id: string): Promise<{ id: bigint }> {
    const rolId = this.parseId(id);
    await this.assertRolExists(rolId);

    const usuariosCount = await this.prisma.usuarios.count({
      where: { id_rol: rolId },
    });
    if (usuariosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el rol porque tiene usuarios asociados',
      );
    }

    const deleted = await this.prisma.roles.delete({
      where: { id: rolId },
      select: { id: true },
    });
    return deleted;
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertRolExists(id: bigint): Promise<void> {
    const rol = await this.prisma.roles.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existente = await this.prisma.roles.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }
  }
}

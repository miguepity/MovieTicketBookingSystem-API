import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './create-role.dto';
import { UpdateRoleDto } from './update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeRol(rol: any) {
    return {
      ...rol,
      id: Number(rol.id),
    };
  }

  async create(createRoleDto: CreateRoleDto) {
    const nombreFormateado = createRoleDto.nombre.toUpperCase().trim();

    const existingRole = await this.prisma.roles.findUnique({
      where: { nombre: nombreFormateado },
    });

    if (existingRole) {
      throw new ConflictException(`El rol '${nombreFormateado}' ya está registrado`);
    }

    const nuevoRol = await this.prisma.roles.create({
      data: { nombre: nombreFormateado },
    });

    return this.serializeRol(nuevoRol);
  }

  async findAll() {
    const roles = await this.prisma.roles.findMany({
      orderBy: { id: 'asc' },
    });
    return roles.map((rol) => this.serializeRol(rol));
  }

  async findOne(id: number) {
    const rol = await this.prisma.roles.findUnique({
      where: { id: BigInt(id) },
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }

    return this.serializeRol(rol);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);

    if (updateRoleDto.nombre) {
      const nombreFormateado = updateRoleDto.nombre.toUpperCase().trim();

      const existingRole = await this.prisma.roles.findUnique({
        where: { nombre: nombreFormateado },
      });

      if (existingRole && Number(existingRole.id) !== id) {
        throw new ConflictException(`Ya existe otro rol con el nombre '${nombreFormateado}'`);
      }

      updateRoleDto.nombre = nombreFormateado;
    }

    const rolActualizado = await this.prisma.roles.update({
      where: { id: BigInt(id) },
      data: updateRoleDto,
    });

    return this.serializeRol(rolActualizado);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.roles.delete({
        where: { id: BigInt(id) },
      });
      return { message: `Rol con ID ${id} eliminado exitosamente` };
    } catch (error) {
      throw new ConflictException(
        'No se puede eliminar el rol porque existen usuarios asociados a él.',
      );
    }
  }
}
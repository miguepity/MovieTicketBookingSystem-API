import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBigInt(data: any) {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.roles.create({
      data: createRoleDto,
    });
    return this.serializeBigInt(role);
  }

  async findAll() {
    const roles = await this.prisma.roles.findMany();
    return this.serializeBigInt(roles);
  }

  async findOne(id: number) {
    const role = await this.prisma.roles.findUnique({
      where: { id: BigInt(id) },
    });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return this.serializeBigInt(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    const updatedRole = await this.prisma.roles.update({
      where: { id: BigInt(id) },
      data: updateRoleDto,
    });
    return this.serializeBigInt(updatedRole);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.roles.delete({
      where: { id: BigInt(id) },
    });
    return { message: `Rol con ID ${id} eliminado correctamente` };
  }
}

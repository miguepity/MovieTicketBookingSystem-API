import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) {}

    async getMyProfile(userId: number) {
      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: BigInt(userId) },
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
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
      }

      return {
        message: 'Perfil del usuario obtenido exitosamente.',
        user: {
          ...usuario,
          id: Number(usuario.id),
          roles: {
            id: Number(usuario.roles.id),
            nombre: usuario.roles.nombre,
          },
        },
      };
    }

    async notificationStatus(id: number) {
        const user = await this.prisma.usuarios.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`Usuario con id ${id} no encontrado`);
        }

        return this.prisma.usuarios.update({
            where: { id },
            data: { notificaciones_activas: !user.notificaciones_activas },
        });
    }

    async cambiarEmail(userId: number, updateEmailDto: UpdateEmailDto) {
    const { email } = updateEmailDto;
    const userIdBigInt = BigInt(userId);

    const emailEnUso = await this.prisma.usuarios.findFirst({
      where: {
        email: email,
        NOT: {
          id: userIdBigInt,
        },
      },
    });

    if (emailEnUso) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado por otro usuario.');
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: userIdBigInt },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    const usuarioActualizado = await this.prisma.usuarios.update({
      where: { id: userIdBigInt },
      data: { email },
    });
    return {
      message: 'Correo electrónico actualizado con éxito.',
      usuario: {
        id: usuarioActualizado.id,
        email: usuarioActualizado.email,
        updated_at: usuarioActualizado.updated_at,
      },
    };
  }

  async cambiarPassword( idUsuarioAutenticado: number, dto: UpdatePasswordDto) {

    const { passwordActual, passwordNueva } = dto;
    const userIdBigInt = BigInt(idUsuarioAutenticado);

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: userIdBigInt },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuarioAutenticado} no encontrado.`);
    }

    const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash);
    
    if (!passwordValida) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    const esMismaPassword = await bcrypt.compare(passwordNueva, usuario.password_hash);
    if (esMismaPassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la contraseña actual.');
    }
    const saltRounds = 10;
    const nuevoHash = await bcrypt.hash(passwordNueva, saltRounds);

    await this.prisma.usuarios.update({
      where: { id: userIdBigInt },
      data: { password_hash: nuevoHash },
    });

    return {
      message: 'Contraseña actualizada exitosamente.',
    };
  }
}

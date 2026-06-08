import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateEmailDto } from "./dto/update-email.dto";

@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) {}

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
}
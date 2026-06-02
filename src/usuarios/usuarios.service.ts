import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async updateUserEmail(userId: number, newEmail: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    // Verificar que el nuevo email sea diferente al actual
    if (usuario.email === newEmail) {
      throw new BadRequestException('El nuevo email es igual al actual');
    }

    // Verificar que el email no esté ya en uso
    const emailExistente = await this.prisma.usuarios.findUnique({
      where: { email: newEmail },
    });

    if (emailExistente) {
      throw new BadRequestException('El email ya está en uso por otro usuario');
    }

    // Actualizar el email
    return await this.prisma.usuarios.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  }
}

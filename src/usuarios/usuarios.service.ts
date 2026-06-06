import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ConfirmarRegistroDto } from './dto/confirmar-registro.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Se actualiza mapeando al campo 'estado' de la tabla usuarios
    const usuarioActualizado = await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { estado: dto.status },
    });

    return {
      message: 'Estado del usuario actualizado exitosamente.',
      id: Number(usuarioActualizado.id),
      status: usuarioActualizado.estado,
    };
  }

  async confirmarRegistro(dto: ConfirmarRegistroDto) {
    let userId: number;

    try {
      const payload = this.jwtService.verify(dto.token);
      userId = payload.sub; 
    } catch (error) {
      throw new BadRequestException(
        'El token de confirmación es inválido o ha expirado.',
      );
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.estado === 'activo') {
      throw new BadRequestException(
        'Esta cuenta ya se encuentra verificada y activa.',
      );
    }

    await this.prisma.usuarios.update({
      where: { id: BigInt(userId) },
      data: { estado: 'activo' },
    });

    return { message: 'Cuenta confirmada y activada exitosamente.' };
  }
}

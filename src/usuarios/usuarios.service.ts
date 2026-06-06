import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ConfirmarRegistroDto } from './dto/confirmar-registro.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async updateUserEmail(userId: number, newEmail: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(userId) },
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
      where: { id: BigInt(userId) },
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

  async updatePassword(id: number, dto: UpdatePasswordDto) {
    // 1. Buscar al usuario por su ID usando BigInt
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // 2. Verificar si la contraseña actual coincide con el hash
    const isMatch = await bcrypt.compare(
      dto.oldPassword,
      usuario.password_hash,
    );
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    // 3. Hashear la nueva contraseña con el factor de 10
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    // 4. Actualizar el registro en la base de datos
    await this.prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { password_hash: newPasswordHash },
    });

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
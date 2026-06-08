import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

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
}
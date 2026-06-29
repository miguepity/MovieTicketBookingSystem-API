import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SuscripcionesEstrenoService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(idPelicula: bigint, idUsuario: bigint): Promise<void> {
    await this.prisma.suscripcionEstreno.upsert({
      where: { id_usuario_id_pelicula: { id_usuario: idUsuario, id_pelicula: idPelicula } },
      create: { id_usuario: idUsuario, id_pelicula: idPelicula },
      update: {},
    });
  }

  async unsubscribe(idPelicula: bigint, idUsuario: bigint): Promise<void> {
    await this.prisma.suscripcionEstreno.deleteMany({
      where: { id_usuario: idUsuario, id_pelicula: idPelicula },
    });
  }

  async listarPorUsuario(idUsuario: bigint): Promise<string[]> {
    const rows = await this.prisma.suscripcionEstreno.findMany({
      where: { id_usuario: idUsuario },
      select: { id_pelicula: true },
    });
    return rows.map((r) => r.id_pelicula.toString());
  }

  async listarNoNotificadosDePelicula(idPelicula: bigint): Promise<Array<{
    suscripcionId: bigint; idUsuario: bigint; nombre: string; email: string;
  }>> {
    const rows = await this.prisma.suscripcionEstreno.findMany({
      where: { id_pelicula: idPelicula, notificado_at: null },
      include: { usuarios: { select: { id: true, nombre: true, email: true } } },
    });
    return rows.map((r) => ({
      suscripcionId: r.id,
      idUsuario: r.usuarios.id,
      nombre: r.usuarios.nombre,
      email: r.usuarios.email,
    }));
  }

  async marcarNotificados(ids: bigint[]): Promise<void> {
    if (ids.length === 0) return;
    await this.prisma.suscripcionEstreno.updateMany({
      where: { id: { in: ids } },
      data: { notificado_at: new Date() },
    });
  }
}

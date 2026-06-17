import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdiomaDto } from './create-idiomas.dto';
import { UpdateIdiomaDto } from './update-idiomas.dto';

@Injectable()
export class IdiomasService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeIdioma(idioma: any) {
    return { ...idioma, id: Number(idioma.id) };
  }

  async create(createIdiomaDto: CreateIdiomaDto, auditorId: number) {
    const nombreFormateado = createIdiomaDto.nombre.toUpperCase().trim();

    const existing = await this.prisma.idiomas.findUnique({
      where: { nombre: nombreFormateado },
    });
    if (existing) throw new ConflictException(`El idioma '${nombreFormateado}' ya existe.`);

    const nuevo = await this.prisma.idiomas.create({
      data: { nombre: nombreFormateado },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'IDIOMA_CREADO',
        detalle: `Idioma '${nombreFormateado}' creado`,
      },
    });

    return this.serializeIdioma(nuevo);
  }

  async findAll() {
    const idiomas = await this.prisma.idiomas.findMany({ orderBy: { nombre: 'asc' } });
    return idiomas.map(i => this.serializeIdioma(i));
  }

  async findOne(id: number) {
    const idioma = await this.prisma.idiomas.findUnique({ where: { id: BigInt(id) } });
    if (!idioma) throw new NotFoundException(`El idioma con ID ${id} no existe.`);
    return this.serializeIdioma(idioma);
  }

  async update(id: number, updateIdiomaDto: UpdateIdiomaDto, auditorId: number) {
    await this.findOne(id);

    if (updateIdiomaDto.nombre) {
      const nombreFormateado = updateIdiomaDto.nombre.toUpperCase().trim();
      const existing = await this.prisma.idiomas.findUnique({ where: { nombre: nombreFormateado } });

      if (existing && Number(existing.id) !== id) {
        throw new ConflictException(`Ya existe otro idioma con el nombre '${nombreFormateado}'.`);
      }
      updateIdiomaDto.nombre = nombreFormateado;
    }

    const actualizado = await this.prisma.idiomas.update({
      where: { id: BigInt(id) },
      data: updateIdiomaDto,
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'IDIOMA_ACTUALIZADO',
        detalle: `Idioma ${id} actualizado`,
      },
    });

    return this.serializeIdioma(actualizado);
  }

  async remove(id: number, auditorId: number) {
    await this.findOne(id);
    try {
      await this.prisma.idiomas.delete({ where: { id: BigInt(id) } });

      await this.prisma.auditLog.create({
        data: {
          id_usuario: BigInt(auditorId),
          id_auditor: BigInt(auditorId),
          accion: 'IDIOMA_ELIMINADO',
          detalle: `Idioma ${id} eliminado`,
        },
      });

      return { message: `Idioma con ID ${id} eliminado exitosamente.` };
    } catch {
      throw new ConflictException('No se puede eliminar porque existen películas configuradas en este idioma.');
    }
  }
}
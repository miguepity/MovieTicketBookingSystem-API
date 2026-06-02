import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGeneroDto: CreateGeneroDto) {
    return this.prisma.generos.create({ data: createGeneroDto });
  }

  findAll() {
    return this.prisma.generos.findMany();
  }

  findOne(id: number) {
    return this.prisma.generos.findUnique({ where: { id } });
  }

  update(id: number, updateGeneroDto: UpdateGeneroDto) {
    return this.prisma.generos.update({ where: { id }, data: updateGeneroDto });
  }

  remove(id: number) {
    return this.prisma.generos.delete({ where: { id } });
  }
}

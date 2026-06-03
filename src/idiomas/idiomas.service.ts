import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createIdiomaDto: CreateIdiomaDto) {
    return this.prisma.idiomas.create({ data: createIdiomaDto });
  }

  findAll() {
    return this.prisma.idiomas.findMany();
  }

  findOne(id: number) {
    return this.prisma.idiomas.findUnique({ where: { id } });
  }

  update(id: number, updateIdiomaDto: UpdateIdiomaDto) {
    return this.prisma.idiomas.update({ where: { id }, data: updateIdiomaDto });
  }

  remove(id: number) {
    return this.prisma.idiomas.delete({ where: { id } });
  }
}

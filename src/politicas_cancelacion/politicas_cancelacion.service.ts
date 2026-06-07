import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PoliticaCancelacion } from '@prisma/client';

@Injectable()
export class PoliticasCancelacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PoliticaCancelacion[]> {
    return this.prisma.politicaCancelacion.findMany();
  }
}

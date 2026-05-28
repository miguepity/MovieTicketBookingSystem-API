import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    console.debug(
      '[PrismaService] Initializing PrismaClient with connection string:',
      connectionString,
    );
    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }
  
  async onModuleInit() {
    await this.$connect();
    console.log('[PrismaService] Connected to the database!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/scripts/default-index.js';

@Injectable()
export class PrismaService extends PrismaClient {}

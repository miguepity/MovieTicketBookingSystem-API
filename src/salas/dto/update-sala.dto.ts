import { PartialType } from '@nestjs/swagger';
import { BodyDto } from './salas.body.dto';

export class UpdateSalaDto extends PartialType(BodyDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateCineDto } from './cine.body.dto';

export class UpdateCineDto extends PartialType(CreateCineDto) {}

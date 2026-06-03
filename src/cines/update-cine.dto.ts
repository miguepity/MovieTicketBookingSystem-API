import { PartialType } from '@nestjs/swagger';
import { CreateCineDto } from './create-cine.dto';

export class UpdateCineDto extends PartialType(CreateCineDto) {}
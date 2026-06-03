import { PartialType } from '@nestjs/swagger';
import { CreateCuponeDto } from './create-cupones.dto';

export class UpdateCuponeDto extends PartialType(CreateCuponeDto) {}

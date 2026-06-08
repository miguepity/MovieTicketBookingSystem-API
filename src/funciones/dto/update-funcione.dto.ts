import { PartialType } from '@nestjs/swagger';
import { CreateFuncioneDto } from './create-funcione.dto';

export class UpdateFuncioneDto extends PartialType(CreateFuncioneDto) {}

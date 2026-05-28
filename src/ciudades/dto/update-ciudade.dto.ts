import { PartialType } from '@nestjs/swagger';
import { CreateCiudadeDto } from './create-ciudade.dto';

export class UpdateCiudadeDto extends PartialType(CreateCiudadeDto) {}

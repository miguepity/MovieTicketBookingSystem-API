import { PartialType } from '@nestjs/swagger';
import { CreateGeneroDto } from './create-generos.dto';

export class UpdateGeneroDto extends PartialType(CreateGeneroDto) {}
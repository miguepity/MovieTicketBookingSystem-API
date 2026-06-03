import { PartialType } from '@nestjs/swagger';
import { CreateIdiomaDto } from './create-idioma.dto';

export class UpdateIdiomaDto extends PartialType(CreateIdiomaDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateIdiomaDto } from './create-idiomas.dto';

export class UpdateIdiomaDto extends PartialType(CreateIdiomaDto) {}
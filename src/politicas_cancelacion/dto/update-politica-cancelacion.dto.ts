import { PartialType } from '@nestjs/swagger';
import { CreatePoliticaCancelacionDto } from './create-politica-cancelacion.dto';

export class UpdatePoliticaCancelacionDto extends PartialType(CreatePoliticaCancelacionDto) {}

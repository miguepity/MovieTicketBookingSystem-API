import { PartialType } from '@nestjs/swagger';
import { CreateTipoAsientoDto } from './create-tipo-asiento.dto';

export class UpdateTipoAsientoDto extends PartialType(CreateTipoAsientoDto) {}

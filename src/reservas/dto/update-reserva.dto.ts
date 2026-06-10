import { PartialType } from '@nestjs/mapped-types';
import { ReservasBodyDto } from './reservas.body.dto';

export class UpdateReservaDto extends PartialType(ReservasBodyDto) {}

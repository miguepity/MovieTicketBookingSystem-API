import { PartialType } from '@nestjs/swagger';
import { PoliticasBodyDto } from './politicas.cancelacion.body.dto';

export class UpdatePoliticasDto extends PartialType(PoliticasBodyDto) {}

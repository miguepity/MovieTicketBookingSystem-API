import { PartialType } from '@nestjs/swagger';
import { CreatePoliticasCancelacionDto } from './create-politicas-cancelacion.dto';

export class UpdatePoliticasCancelacionDto extends PartialType(
  CreatePoliticasCancelacionDto,
) {}

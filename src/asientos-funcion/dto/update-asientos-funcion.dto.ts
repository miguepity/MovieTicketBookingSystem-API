import { PartialType } from '@nestjs/swagger';
import { CreateAsientosFuncionDto } from './create-asientos-funcion.dto';

export class UpdateAsientosFuncionDto extends PartialType(
  CreateAsientosFuncionDto,
) {}

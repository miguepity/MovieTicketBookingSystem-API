import { PartialType } from '@nestjs/swagger';
import { CreateFuncionDto } from './create-funcion.dto';

export class UpdateFuncionDto extends PartialType(CreateFuncionDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateFuncionDto } from './create-funciones.dto';

export class UpdateFuncionDto extends PartialType(CreateFuncionDto) {}
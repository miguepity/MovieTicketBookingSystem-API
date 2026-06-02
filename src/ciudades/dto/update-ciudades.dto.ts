import { PartialType } from '@nestjs/mapped-types';
import { CreateCiudadesDto } from './create-ciudades.dto';

export class UpdateCiudadesDto extends PartialType(CreateCiudadesDto) {}

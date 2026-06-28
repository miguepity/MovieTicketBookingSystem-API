import { PartialType } from '@nestjs/swagger';
import { CreateCiudadesDto } from './create-ciudades.dto';

export class UpdateCiudadesDto extends PartialType(CreateCiudadesDto) {}

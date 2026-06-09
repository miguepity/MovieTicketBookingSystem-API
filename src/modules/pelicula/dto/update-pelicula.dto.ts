import { PartialType } from '@nestjs/swagger';
import { CreatePeliculaDto } from './create-pelicula.dto';

export class UpdatePeliculaDto extends PartialType(CreatePeliculaDto) {}

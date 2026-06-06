import { Injectable } from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@Injectable()
export class FuncionesService {
  create(createFuncioneDto: CreateFuncioneDto) {
    return 'This action adds a new funcione';
  }
}

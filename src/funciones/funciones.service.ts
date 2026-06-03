import { Injectable } from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@Injectable()
export class FuncionesService {
  create(createFuncioneDto: CreateFuncioneDto) {
    return 'This action adds a new funcione';
  }

  findAll() {
    return `This action returns all funciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} funcione`;
  }

  update(id: number, updateFuncioneDto: UpdateFuncioneDto) {
    return `This action updates a #${id} funcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} funcione`;
  }
}

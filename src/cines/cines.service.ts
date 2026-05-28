import { Injectable } from '@nestjs/common';
import { CreateCineDto } from './dto/create-cine.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

@Injectable()
export class CinesService {
  create(createCineDto: CreateCineDto) {
    return 'This action adds a new cine';
  }

  findAll() {
    return `This action returns all cines`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cine`;
  }

  update(id: number, updateCineDto: UpdateCineDto) {
    return `This action updates a #${id} cine`;
  }

  remove(id: number) {
    return `This action removes a #${id} cine`;
  }
}

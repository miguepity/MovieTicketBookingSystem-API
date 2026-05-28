import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CinesService } from './cines.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

@Controller('cines')
export class CinesController {
  constructor(private readonly cinesService: CinesService) {}

  @Post()
  create(@Body() createCineDto: CreateCineDto) {
    return this.cinesService.create(createCineDto);
  }

  @Get()
  findAll() {
    return this.cinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cinesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCineDto: UpdateCineDto) {
    return this.cinesService.update(+id, updateCineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cinesService.remove(+id);
  }
}

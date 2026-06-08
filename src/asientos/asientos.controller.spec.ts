import { Test, TestingModule } from '@nestjs/testing';
import { AsientosController } from './asientos.controller';
import { AsientosService } from './asientos.service';

describe('AsientosController', () => {
  let controller: AsientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsientosController],
      providers: [AsientosService],
    }).compile();

    controller = module.get<AsientosController>(AsientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

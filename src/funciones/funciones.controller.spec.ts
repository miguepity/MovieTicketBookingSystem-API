import { Test, TestingModule } from '@nestjs/testing';
import { FuncionesController } from './funciones.controller';
import { FuncionesService } from './funciones.service';

describe('FuncionesController', () => {
  let controller: FuncionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncionesController],
      providers: [FuncionesService],
    }).compile();

    controller = module.get<FuncionesController>(FuncionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

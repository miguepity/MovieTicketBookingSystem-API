import { Test, TestingModule } from '@nestjs/testing';
import { ReembolsosController } from './reembolsos.controller';

describe('ReembolsosController', () => {
  let controller: ReembolsosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReembolsosController],
    }).compile();

    controller = module.get<ReembolsosController>(ReembolsosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

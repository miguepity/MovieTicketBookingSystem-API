import { Test, TestingModule } from '@nestjs/testing';
import { IdiomasController } from './idiomas.controller';

describe('IdiomasController', () => {
  let controller: IdiomasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdiomasController],
    }).compile();

    controller = module.get<IdiomasController>(IdiomasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

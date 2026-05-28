import { Test, TestingModule } from '@nestjs/testing';
import { CinesController } from './cines.controller';
import { CinesService } from './cines.service';

describe('CinesController', () => {
  let controller: CinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinesController],
      providers: [CinesService],
    }).compile();

    controller = module.get<CinesController>(CinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

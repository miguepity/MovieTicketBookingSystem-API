import { Test, TestingModule } from '@nestjs/testing';
import { PoliticaCancelacionController } from './politica-cancelacion.controller';

describe('PoliticaCancelacionController', () => {
  let controller: PoliticaCancelacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliticaCancelacionController],
    }).compile();

    controller = module.get<PoliticaCancelacionController>(
      PoliticaCancelacionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

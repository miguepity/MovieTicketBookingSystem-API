import { Test, TestingModule } from '@nestjs/testing';
import { PoliticaCancelacionService } from './politica-cancelacion.service';

describe('PoliticaCancelacionService', () => {
  let service: PoliticaCancelacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoliticaCancelacionService],
    }).compile();

    service = module.get<PoliticaCancelacionService>(
      PoliticaCancelacionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

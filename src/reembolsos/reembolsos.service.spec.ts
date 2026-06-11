import { Test, TestingModule } from '@nestjs/testing';
import { ReembolsosService } from './reembolsos.service';

describe('ReembolsosService', () => {
  let service: ReembolsosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReembolsosService],
    }).compile();

    service = module.get<ReembolsosService>(ReembolsosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

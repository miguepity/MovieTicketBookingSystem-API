import { Test, TestingModule } from '@nestjs/testing';
import { AsientosService } from './asientos.service';

describe('AsientosService', () => {
  let service: AsientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsientosService],
    }).compile();

    service = module.get<AsientosService>(AsientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

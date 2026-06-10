import { Test, TestingModule } from '@nestjs/testing';
import { IdiomasService } from './idiomas.service';

describe('IdiomasService', () => {
  let service: IdiomasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdiomasService],
    }).compile();

    service = module.get<IdiomasService>(IdiomasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

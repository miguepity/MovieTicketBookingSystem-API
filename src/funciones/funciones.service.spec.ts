import { Test, TestingModule } from '@nestjs/testing';
import { FuncionesService } from './funciones.service';

describe('FuncionesService', () => {
  let service: FuncionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FuncionesService],
    }).compile();

    service = module.get<FuncionesService>(FuncionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

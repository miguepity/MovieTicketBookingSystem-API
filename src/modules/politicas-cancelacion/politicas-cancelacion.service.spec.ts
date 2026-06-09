import { Test } from '@nestjs/testing';
import { PoliticasCancelacionService } from './politicas-cancelacion.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('PoliticasCancelacionService', () => {
  let service: PoliticasCancelacionService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  beforeEach(async () => {
    prisma = {
      cines: { findUnique: jest.fn() },
      politicaCancelacion: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      reglaPoliticaCancelacion: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(prisma)),
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        PoliticasCancelacionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(PoliticasCancelacionService);
  });

  it('crear: rechaza si cine no existe', async () => {
    prisma.cines.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.create(
        {
          id_cine: '99',
          nombre: 'P1',
          reglas: [
            { horas_antes_minimo: 0, horas_antes_maximo: 24, porcentaje_reembolso: 50 },
          ],
        },
        1n,
      ),
    ).rejects.toThrow(/cine/i);
  });

  it('crear: rechaza reglas traslapadas', async () => {
    prisma.cines.findUnique.mockResolvedValueOnce({ id: 1n });
    await expect(
      service.create(
        {
          id_cine: '1',
          nombre: 'P1',
          reglas: [
            { horas_antes_minimo: 0, horas_antes_maximo: 24, porcentaje_reembolso: 50 },
            { horas_antes_minimo: 12, horas_antes_maximo: 36, porcentaje_reembolso: 80 },
          ],
        },
        1n,
      ),
    ).rejects.toThrow(/traslap/i);
  });

  it('crear: desactiva la activa previa y crea la nueva', async () => {
    prisma.cines.findUnique.mockResolvedValueOnce({ id: 1n });
    prisma.politicaCancelacion.create.mockResolvedValueOnce({
      id: 5n,
      id_cine: 1n,
      nombre: 'P1',
      activa: true,
    });
    prisma.politicaCancelacion.findUnique.mockResolvedValueOnce({
      id: 5n,
      id_cine: 1n,
      nombre: 'P1',
      activa: true,
      reglas: [],
    });

    await service.create(
      {
        id_cine: '1',
        nombre: 'P1',
        reglas: [
          { horas_antes_minimo: 0, horas_antes_maximo: 24, porcentaje_reembolso: 50 },
        ],
      },
      9n,
    );

    expect(prisma.politicaCancelacion.updateMany).toHaveBeenCalledWith({
      where: { id_cine: 1n, activa: true },
      data: { activa: false },
    });
    expect(prisma.politicaCancelacion.create).toHaveBeenCalled();
    expect(prisma.reglaPoliticaCancelacion.createMany).toHaveBeenCalled();
    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ accion: 'POLITICA_CREAR', id_auditor: 9n }),
    );
  });
});

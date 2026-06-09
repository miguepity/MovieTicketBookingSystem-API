import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = { auditLog: { create: jest.fn().mockResolvedValue({}) } };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it('crea un registro de auditoría con los campos requeridos', async () => {
    await service.registrar({
      id_usuario: 1n,
      id_auditor: 2n,
      accion: 'LOGIN',
      detalle: 'login ok',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        id_usuario: 1n,
        id_auditor: 2n,
        accion: 'LOGIN',
        detalle: 'login ok',
      },
    });
  });

  it('si la inserción falla, no propaga el error', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    prisma.auditLog.create.mockRejectedValueOnce(new Error('db down'));
    await expect(
      service.registrar({ id_usuario: 1n, id_auditor: 1n, accion: 'LOGIN' }),
    ).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

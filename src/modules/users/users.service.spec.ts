import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed_new'),
}));

describe('UsersService (audit-log instrumentation)', () => {
  let service: UsersService;
  let prisma: any;
  let auditLog: { registrar: jest.Mock };

  const baseUsuario = {
    id: 5n,
    nombre: 'Ada',
    email: 'ada@example.com',
    id_rol: 2n,
    estado: 'activo',
    notificaciones_activas: true,
    roles: { nombre: 'cliente' },
    password_hash: 'hashed_current',
  };

  const adminAuditor = {
    id: 9n,
    roles: { nombre: 'admin' },
  };

  beforeEach(async () => {
    prisma = {
      usuarios: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    auditLog = { registrar: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('updateStatus: registra USUARIO_TOGGLE_ESTADO con ambos snapshots', async () => {
    prisma.usuarios.findUnique
      .mockResolvedValueOnce(adminAuditor) // auditor lookup
      .mockResolvedValueOnce({ ...baseUsuario }) // prev
      .mockResolvedValueOnce({ ...baseUsuario, estado: 'inactivo' }); // updated
    prisma.usuarios.update.mockResolvedValueOnce({});

    await service.updateStatus('5', '9', { estado: 'inactivo' } as any);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'USUARIO_TOGGLE_ESTADO',
        entidad: 'Usuario',
        entidad_id: 5n,
        id_auditor: 9n,
        valor_anterior: expect.objectContaining({ estado: 'activo' }),
        valor_nuevo: expect.objectContaining({ estado: 'inactivo' }),
      }),
    );
  });

  it('toggleNotificaciones: registra USUARIO_TOGGLE_NOTIFICACIONES con ambos snapshots', async () => {
    prisma.usuarios.findUnique
      .mockResolvedValueOnce({ ...baseUsuario }) // prev
      .mockResolvedValueOnce({
        ...baseUsuario,
        notificaciones_activas: false,
      }); // updated
    prisma.usuarios.update.mockResolvedValueOnce({});

    await service.toggleNotificaciones('5', '5');

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'USUARIO_TOGGLE_NOTIFICACIONES',
        entidad: 'Usuario',
        entidad_id: 5n,
        valor_anterior: expect.objectContaining({
          notificaciones_activas: true,
        }),
        valor_nuevo: expect.objectContaining({
          notificaciones_activas: false,
        }),
      }),
    );
  });

  it('updatePassword: registra USUARIO_EDITAR_PASSWORD sin snapshots', async () => {
    prisma.usuarios.findUnique.mockResolvedValueOnce({ ...baseUsuario });
    prisma.usuarios.update.mockResolvedValueOnce({});

    await service.updatePassword('5', '5', {
      currentPassword: 'old',
      newPassword: 'new',
    } as any);

    expect(auditLog.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'USUARIO_EDITAR_PASSWORD',
        entidad: 'Usuario',
        entidad_id: 5n,
      }),
    );
    const call = auditLog.registrar.mock.calls[0][0];
    expect(call.valor_anterior).toBeUndefined();
    expect(call.valor_nuevo).toBeUndefined();
  });
});

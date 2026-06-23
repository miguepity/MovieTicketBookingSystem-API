import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('<mock-bcrypt-output>'),
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
    password_hash: '<mock-unused-in-bcrypt-mock>',
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

    await service.updateStatus('5', '9', { estado: 'inactivo' });

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
      currentPassword: '<mock-current>',
      newPassword: '<mock-new>',
    });

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

  it('updatePerfil: actualiza nombre, telefono y notificaciones_activas', async () => {
    prisma.usuarios.update.mockResolvedValueOnce({
      id: 5n,
      nombre: 'Ada Lovelace',
      email: 'ada@example.com',
      telefono: '+502 1234 5678',
      notificaciones_activas: false,
    });

    const result = await service.updatePerfil(5n, {
      nombre: 'Ada Lovelace',
      telefono: '+502 1234 5678',
      notificaciones_activas: false,
    });

    expect(prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5n },
        data: {
          nombre: 'Ada Lovelace',
          telefono: '+502 1234 5678',
          notificaciones_activas: false,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          notificaciones_activas: true,
        },
      }),
    );
    expect(result.notificaciones_activas).toBe(false);
    expect(result.nombre).toBe('Ada Lovelace');
  });
});

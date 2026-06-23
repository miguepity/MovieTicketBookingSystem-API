import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('<hashed-password>'),
}));

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() =>
      Buffer.from('deadbeefdeadbeefdeadbeefdeadbeef', 'hex'),
    ),
    randomUUID: actual.randomUUID,
  };
});

describe('AuthService — forgotPassword & resetPassword', () => {
  let service: AuthService;
  let prisma: any;
  let mailService: { sendEmail: jest.Mock };

  const mockUsuario = {
    id: 1n,
    nombre: 'Juan',
    email: 'juan@example.com',
    password_hash: '<old-hash>',
    id_rol: 2n,
    estado: 'activo',
  };

  const now = new Date();
  const futureExpiry = new Date(now.getTime() + 60 * 60 * 1000);
  const pastExpiry = new Date(now.getTime() - 1000);

  const validToken = {
    id: 10n,
    id_usuario: 1n,
    token: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    expires_at: futureExpiry,
    usado: false,
    created_at: now,
  };

  const expiredToken = { ...validToken, id: 11n, expires_at: pastExpiry };
  const usedToken = { ...validToken, id: 12n, usado: true };

  beforeEach(async () => {
    prisma = {
      usuarios: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 10n }),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      jwtBlacklist: {
        upsert: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (ops: unknown[]) => Promise.all(ops)),
    };

    mailService = { sendEmail: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
        { provide: MailService, useValue: mailService },
        {
          provide: AuditLogService,
          useValue: { registrar: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────

  it('forgotPassword: sends email when user exists', async () => {
    prisma.usuarios.findUnique.mockResolvedValueOnce(mockUsuario);

    const result = await service.forgotPassword({ email: mockUsuario.email });

    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_usuario: mockUsuario.id,
        }),
      }),
    );
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.objectContaining({ email: mockUsuario.email }),
        subject: expect.stringContaining('contraseña'),
        htmlContent: expect.stringContaining('reset-password'),
      }),
    );
    expect(result).toHaveProperty('message');
  });

  it('forgotPassword: silently succeeds when user does not exist (no enumeration)', async () => {
    prisma.usuarios.findUnique.mockResolvedValueOnce(null);

    const result = await service.forgotPassword({
      email: 'noexiste@example.com',
    });

    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mailService.sendEmail).not.toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });

  // ─── resetPassword ────────────────────────────────────────────────────────

  it('resetPassword: happy path — hashes password and commits transaction', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValueOnce(validToken);
    prisma.usuarios.update.mockResolvedValueOnce({});

    const result = await service.resetPassword({
      token: validToken.token,
      newPassword: 'NuevaPassword123',
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });

  it('resetPassword: throws BadRequestException for expired token', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValueOnce(expiredToken);

    await expect(
      service.resetPassword({
        token: expiredToken.token,
        newPassword: 'NuevaPassword123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('resetPassword: throws BadRequestException for used token', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValueOnce(usedToken);

    await expect(
      service.resetPassword({
        token: usedToken.token,
        newPassword: 'NuevaPassword123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthService', () => {
  type PasswordResetCreateArgs = {
    data: {
      id_usuario: bigint;
      token: string;
      expires_at: Date;
    };
  };

  const createPasswordResetToken = jest.fn<
    Promise<void>,
    [PasswordResetCreateArgs]
  >();
  const sendPasswordResetEmail = jest.fn<Promise<void>, [string, string]>();

  const prisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      updateMany: jest.fn(),
      create: createPasswordResetToken,
    },
  };
  const mailService = {
    sendPasswordResetEmail,
  };

  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(prisma as never, mailService as never);
  });

  it('rejects invalid emails', async () => {
    await expect(
      authService.forgotPassword({ email: 'bad-email' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a generic response when the email does not exist', async () => {
    prisma.usuarios.findUnique.mockResolvedValue(null);

    const response = await authService.forgotPassword({
      email: 'USER@example.com',
    });

    expect(response).toHaveProperty('message');
    expect(prisma.usuarios.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: { id: true, email: true },
    });
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('creates a reset token and sends the email when the user exists', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({
      id: 1n,
      email: 'user@example.com',
    });

    const response = await authService.forgotPassword({
      email: 'user@example.com',
    });

    expect(response).toHaveProperty('message');
    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { id_usuario: 1n, usado: false },
      data: { usado: true },
    });

    const createArgs = createPasswordResetToken.mock.calls[0][0];
    const sentToken = sendPasswordResetEmail.mock.calls[0][1];

    expect(createArgs.data.id_usuario).toBe(1n);
    expect(typeof createArgs.data.token).toBe('string');
    expect(createArgs.data.token).toMatch(/^\$2[aby]\$/);
    expect(createArgs.data.token).not.toBe(sentToken);
    expect(createArgs.data.expires_at).toBeInstanceOf(Date);
    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      sentToken,
    );
  });
});

import * as crypto from 'crypto';
import { prisma, runSeed, loadUsuarios } from './_bootstrap';
import type { UsuariosMap } from './usuarios';

export async function seedPasswordResetTokens(
  usuarios: UsuariosMap,
): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const usuario = usuarios.all[i % usuarios.all.length];
    const token = crypto
      .createHash('sha256')
      .update(`seed-${i.toString()}-${usuario.email}`)
      .digest('hex');

    const existing = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.passwordResetToken.create({
      data: {
        id_usuario: usuario.id,
        token,
        expires_at: new Date(Date.now() + (i + 1) * 86400 * 1000),
        usado: i % 4 === 0,
      },
    });
  }
}

if (require.main === module) {
  void runSeed('password-reset-token', async (p) => {
    const usuarios = await loadUsuarios(p);
    await seedPasswordResetTokens(usuarios);
  });
}

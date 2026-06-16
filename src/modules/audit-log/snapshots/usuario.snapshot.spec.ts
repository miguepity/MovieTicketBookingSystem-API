import { snapshotUsuario } from './usuario.snapshot';

describe('snapshotUsuario', () => {
  it('mapea usuario excluyendo password_hash', () => {
    const u = {
      nombre: 'Ada Lovelace',
      email: 'ada@example.com',
      password_hash: '$2b$10$superSecretHash',
      id_rol: 2n,
      estado: 'ACTIVO',
      notificaciones_activas: true,
      roles: { nombre: 'ADMIN' },
    };
    const snap = snapshotUsuario(u as any);
    expect(snap).toEqual({
      nombre: 'Ada Lovelace',
      email: 'ada@example.com',
      id_rol: '2',
      rol_nombre: 'ADMIN',
      estado: 'ACTIVO',
      notificaciones_activas: true,
    });
    expect(snap).not.toHaveProperty('password_hash');
    expect(JSON.stringify(snap)).not.toContain('superSecret');
  });
});

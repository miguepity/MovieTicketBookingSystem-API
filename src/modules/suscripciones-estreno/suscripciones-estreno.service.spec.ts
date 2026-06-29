import { SuscripcionesEstrenoService } from './suscripciones-estreno.service';

describe('SuscripcionesEstrenoService', () => {
  function mkPrisma() {
    return {
      suscripcionEstreno: {
        upsert: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({}),
      },
    } as any;
  }

  it('subscribe es idempotente vía upsert', async () => {
    const prisma = mkPrisma();
    const svc = new SuscripcionesEstrenoService(prisma);
    await svc.subscribe(10n, 7n);
    expect(prisma.suscripcionEstreno.upsert).toHaveBeenCalledWith({
      where: { id_usuario_id_pelicula: { id_usuario: 7n, id_pelicula: 10n } },
      create: { id_usuario: 7n, id_pelicula: 10n },
      update: {},
    });
  });

  it('unsubscribe usa deleteMany (idempotente sin throw)', async () => {
    const prisma = mkPrisma();
    const svc = new SuscripcionesEstrenoService(prisma);
    await svc.unsubscribe(10n, 7n);
    expect(prisma.suscripcionEstreno.deleteMany).toHaveBeenCalledWith({
      where: { id_usuario: 7n, id_pelicula: 10n },
    });
  });

  it('listarPorUsuario retorna ids como strings', async () => {
    const prisma = mkPrisma();
    prisma.suscripcionEstreno.findMany.mockResolvedValue([{ id_pelicula: 10n }, { id_pelicula: 11n }]);
    const svc = new SuscripcionesEstrenoService(prisma);
    const out = await svc.listarPorUsuario(7n);
    expect(out).toEqual(['10', '11']);
  });
});

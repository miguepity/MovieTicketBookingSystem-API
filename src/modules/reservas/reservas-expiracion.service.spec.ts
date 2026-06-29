import { Test } from '@nestjs/testing';
import { ReservasExpiracionService } from './reservas-expiracion.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';

describe('ReservasExpiracionService', () => {
  let service: ReservasExpiracionService;
  let prisma: any;
  let mail: any;

  beforeEach(async () => {
    prisma = {
      reservas: { findMany: jest.fn(), updateMany: jest.fn() },
      asientosFuncion: { updateMany: jest.fn() },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
    };
    mail = { sendReservaExpiradaEmail: jest.fn().mockResolvedValue(undefined) };

    const mod = await Test.createTestingModule({
      providers: [
        ReservasExpiracionService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = mod.get(ReservasExpiracionService);
  });

  it('expira solo reservas pendiente_pago con expira_en vencido', async () => {
    const fixture = {
      id: 1n,
      numero_reserva: 'R-001',
      usuarios: { id: 10n, email: 'u@test.com', nombre: 'User' },
      reservaAsientos: [{ id_asiento_funcion: 100n }, { id_asiento_funcion: 101n }],
      funciones: { peliculas: { titulo: 'Pelicula' }, salas: { nombre: 'Sala 1' } },
    };
    prisma.reservas.findMany.mockResolvedValueOnce([fixture]);
    prisma.reservas.updateMany.mockResolvedValueOnce({ count: 1 });

    await service.run();

    expect(prisma.reservas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ estado: EstadoReserva.PENDIENTE_PAGO }),
      }),
    );
    expect(prisma.reservas.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 1n, estado: EstadoReserva.PENDIENTE_PAGO }),
        data: { estado: EstadoReserva.EXPIRADA },
      }),
    );
    expect(prisma.asientosFuncion.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [100n, 101n] } },
      data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
    });
    expect(mail.sendReservaExpiradaEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: { email: 'u@test.com', name: 'User' },
        numeroReserva: 'R-001',
      }),
    );
  });

  it('no procesa asientos ni mail si el claim falla (race con pago)', async () => {
    const fixture = {
      id: 1n,
      numero_reserva: 'R-002',
      usuarios: { id: 10n, email: 'u@test.com', nombre: 'User' },
      reservaAsientos: [{ id_asiento_funcion: 100n }],
      funciones: { peliculas: { titulo: 'X' }, salas: { nombre: 'S' } },
    };
    prisma.reservas.findMany.mockResolvedValueOnce([fixture]);
    prisma.reservas.updateMany.mockResolvedValueOnce({ count: 0 });

    await service.run();

    expect(prisma.asientosFuncion.updateMany).not.toHaveBeenCalled();
    expect(mail.sendReservaExpiradaEmail).not.toHaveBeenCalled();
  });

  it('falla de mail no rompe la expiración', async () => {
    const fixture = {
      id: 1n,
      numero_reserva: 'R-003',
      usuarios: { id: 10n, email: 'u@test.com', nombre: 'User' },
      reservaAsientos: [],
      funciones: { peliculas: { titulo: 'X' }, salas: { nombre: 'S' } },
    };
    prisma.reservas.findMany.mockResolvedValueOnce([fixture]);
    prisma.reservas.updateMany.mockResolvedValueOnce({ count: 1 });
    mail.sendReservaExpiradaEmail.mockRejectedValueOnce(new Error('SMTP'));

    await expect(service.run()).resolves.toBeUndefined();
  });
});

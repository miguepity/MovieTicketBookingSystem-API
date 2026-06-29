import { BoletosPdfService, PdfReservaInput } from './boletos-pdf.service';
import { BoletoCodeService } from './boleto-code.service';

describe('BoletosPdfService', () => {
  let svc: BoletosPdfService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-123';
    process.env.PDF_PUBLIC_BASE_URL = 'http://localhost:3000';
    svc = new BoletosPdfService(new BoletoCodeService());
  });

  const input: PdfReservaInput = {
    numero_reserva: 'RES-A8K2X9',
    pelicula: { titulo: 'Dune: Parte Tres', poster_url: null, duracion_min: 165, idioma: 'Español' },
    cine: { nombre: 'Multiplaza San Pedro Sula' },
    sala: { nombre: '5' },
    funcion: { fecha_hora: new Date('2026-07-14T19:30:00Z') },
    asientos: [
      { codigo: 'F7', tipo: 'Standard' },
      { codigo: 'F8', tipo: 'Standard' },
      { codigo: 'F9', tipo: 'VIP' },
    ],
    pago: { subtotal: 600, descuento: 60, total: 540, metodo_label: 'Visa **** 4321' },
  };

  it('genera buffer PDF válido', async () => {
    const buf = await svc.generar(input);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(5000);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });

  it('el PDF contiene el número de reserva como texto', async () => {
    const buf = await svc.generar(input);
    const haystack = buf.toString('binary');
    expect(haystack).toContain('RES-A8K2X9');
  });

  it('no falla cuando poster_url es null', async () => {
    await expect(svc.generar({ ...input, pelicula: { ...input.pelicula, poster_url: null } })).resolves.toBeInstanceOf(Buffer);
  });
});

import { BoletoCodeService } from './boleto-code.service';

describe('BoletoCodeService', () => {
  let svc: BoletoCodeService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-123';
    svc = new BoletoCodeService();
  });

  it('firmar produce sufijo de 8 hex y conserva el número', () => {
    const out = svc.firmar('RES-A8K2X9');
    expect(out).toMatch(/^RES-A8K2X9-[0-9a-f]{8}$/);
  });

  it('verificar recupera el número original con HMAC válido', () => {
    const firmado = svc.firmar('RES-A8K2X9');
    expect(svc.verificar(firmado)).toBe('RES-A8K2X9');
  });

  it('verificar retorna null con HMAC manipulado', () => {
    expect(svc.verificar('RES-A8K2X9-deadbeef')).toBeNull();
  });

  it('verificar retorna null con formato inválido', () => {
    expect(svc.verificar('basura')).toBeNull();
    expect(svc.verificar('RES-A8K2X9')).toBeNull();
  });

  it('firmar es determinístico para el mismo input', () => {
    expect(svc.firmar('RES-A8K2X9')).toBe(svc.firmar('RES-A8K2X9'));
  });
});

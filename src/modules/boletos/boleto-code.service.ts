import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class BoletoCodeService {
  private readonly secret = process.env.PDF_HMAC_SECRET ?? process.env.JWT_SECRET ?? 'dev-fallback-secret';

  firmar(numeroReserva: string): string {
    return `${numeroReserva}-${this.hmac(numeroReserva)}`;
  }

  verificar(codigoFirmado: string): string | null {
    const idx = codigoFirmado.lastIndexOf('-');
    if (idx < 0) return null;
    const numero = codigoFirmado.slice(0, idx);
    const firma = codigoFirmado.slice(idx + 1);
    if (firma.length !== 8) return null;

    const esperado = this.hmac(numero);
    if (firma.length !== esperado.length) return null;

    const a = Buffer.from(firma, 'hex');
    const b = Buffer.from(esperado, 'hex');
    if (a.length !== b.length) return null;

    return timingSafeEqual(a, b) ? numero : null;
  }

  private hmac(numeroReserva: string): string {
    return createHmac('sha256', this.secret)
      .update(numeroReserva)
      .digest('hex')
      .slice(0, 8);
  }
}

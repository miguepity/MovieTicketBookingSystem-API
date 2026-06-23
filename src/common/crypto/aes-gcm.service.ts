import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_HEX_LENGTH = 64;

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

@Injectable()
export class AesGcmService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const hex = config.getOrThrow<string>('METODOS_PAGO_ENCRYPTION_KEY');
    if (hex.length !== KEY_HEX_LENGTH) {
      throw new Error(
        `METODOS_PAGO_ENCRYPTION_KEY must be ${KEY_HEX_LENGTH} hex chars (32 bytes), got ${hex.length}`,
      );
    }
    this.key = Buffer.from(hex, 'hex');
  }

  /** Returns 'iv.tag.ct' all base64url. */
  encrypt(plain: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${b64url(iv)}.${b64url(tag)}.${b64url(ct)}`;
  }

  decrypt(payload: string): string {
    const parts = payload.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext payload');
    }
    const [iv, tag, ct] = parts.map(fromB64url);
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString(
      'utf8',
    );
  }
}

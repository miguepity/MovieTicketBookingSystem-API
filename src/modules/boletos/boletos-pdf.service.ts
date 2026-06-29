import { Injectable } from '@nestjs/common';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { BoletoCodeService } from './boleto-code.service';

export interface PdfReservaInput {
  numero_reserva: string;
  pelicula: {
    titulo: string;
    poster_url: string | null;
    duracion_min: number | null;
    idioma: string | null;
  };
  cine: { nombre: string };
  sala: { nombre: string; formato?: string | null };
  funcion: { fecha_hora: Date };
  asientos: Array<{ codigo: string; tipo: string }>;
  pago: {
    subtotal: number;
    descuento: number;
    total: number;
    metodo_label: string;
  };
}

const COLOR = {
  red: '#c8202b',
  orange: '#ee8a3c',
  ink: '#1c1718',
  meta: '#7a6f6f',
  surface: '#fdfafa',
  white: '#ffffff',
} as const;

const FONT = {
  black: 'Manrope-Black',
  bold: 'Manrope-Bold',
  semibold: 'Manrope-SemiBold',
  medium: 'Manrope-Medium',
} as const;

const PAGE_W = 612;
const PAGE_H = 792;
const COL_X = 66;
const COL_W = 480;

@Injectable()
export class BoletosPdfService {
  constructor(private readonly codes: BoletoCodeService) {}

  async generar(input: PdfReservaInput): Promise<Buffer> {
    const doc = new PDFDocument({
      size: [PAGE_W, PAGE_H],
      margin: 0,
      info: { Title: `Boleto ${input.numero_reserva}` },
    });

    this.registerFonts(doc);

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const qrPng = await this.qrFor(input.numero_reserva);

    let y = this.drawMarquee(doc, 0);
    y = this.drawHero(doc, input, y + 24);
    y = this.drawReservaYAsientos(doc, input, y + 24);
    y = this.drawQrYResumen(doc, input, qrPng, y + 24);
    y = this.drawPerforacion(doc, y + 16);
    y = this.drawStub(doc, input, qrPng, y + 12);
    this.drawFooter(doc, PAGE_H - 50);

    doc.end();
    return done;
  }

  private registerFonts(doc: PDFKit.PDFDocument) {
    const dir = path.join(__dirname, '..', '..', '..', 'assets', 'fonts');
    doc.registerFont(FONT.black, path.join(dir, 'Manrope-Black.ttf'));
    doc.registerFont(FONT.bold, path.join(dir, 'Manrope-Bold.ttf'));
    doc.registerFont(FONT.semibold, path.join(dir, 'Manrope-SemiBold.ttf'));
    doc.registerFont(FONT.medium, path.join(dir, 'Manrope-Medium.ttf'));
  }

  private async qrFor(numeroReserva: string): Promise<Buffer> {
    const base = process.env.PDF_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const codigo = this.codes.firmar(numeroReserva);
    const url = `${base}/boletos/${codigo}.pdf`;
    return QRCode.toBuffer(url, {
      type: 'png',
      margin: 0,
      scale: 8,
      color: { dark: COLOR.ink, light: COLOR.white },
    });
  }

  private drawMarquee(doc: PDFKit.PDFDocument, y: number): number {
    doc.rect(0, y, PAGE_W, 100).fill(COLOR.red);
    doc.fillColor(COLOR.white).font(FONT.black).fontSize(24)
      .text('CINETICKETS', COL_X, y + 36, { characterSpacing: 1 });
    doc.font(FONT.medium).fontSize(11)
      .text('BOLETO DIGITAL · 2026', COL_X, y + 44, {
        width: COL_W,
        align: 'right',
        characterSpacing: 2,
      });
    doc.rect(0, y + 99, PAGE_W, 1).fill(COLOR.orange);
    return y + 100;
  }

  private drawHero(doc: PDFKit.PDFDocument, input: PdfReservaInput, y: number): number {
    const posterW = 110;
    const posterH = 165;
    doc.roundedRect(COL_X, y, posterW, posterH, 6).fill(COLOR.surface);
    doc.fillColor(COLOR.meta).font(FONT.semibold).fontSize(9)
      .text('POSTER', COL_X, y + posterH / 2 - 6, { width: posterW, align: 'center', characterSpacing: 2 });

    const infoX = COL_X + posterW + 20;
    const infoW = COL_W - posterW - 20;

    doc.fillColor(COLOR.red).font(FONT.bold).fontSize(9)
      .text('TU BOLETO', infoX, y, { characterSpacing: 2 });
    doc.fillColor(COLOR.ink).font(FONT.black).fontSize(26)
      .text(input.pelicula.titulo, infoX, y + 16, { width: infoW, lineGap: -2 });

    const subY = doc.y + 6;
    const subtitle = [input.pelicula.idioma, input.pelicula.duracion_min ? `${input.pelicula.duracion_min} min` : null]
      .filter(Boolean).join(' · ');
    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(11)
      .text(subtitle, infoX, subY, { width: infoW });

    let rowY = subY + 28;
    rowY = this.drawInfoRow(doc, infoX, infoW, rowY, 'CINE', input.cine.nombre);
    rowY = this.drawInfoRow(doc, infoX, infoW, rowY, 'SALA',
      input.sala.formato ? `${input.sala.nombre} · ${input.sala.formato}` : input.sala.nombre);
    rowY = this.drawInfoRow(doc, infoX, infoW, rowY, 'FUNCIÓN',
      this.fmtFecha(input.funcion.fecha_hora));

    return Math.max(y + posterH, rowY);
  }

  private drawInfoRow(doc: PDFKit.PDFDocument, x: number, w: number, y: number, label: string, value: string): number {
    doc.fillColor(COLOR.meta).font(FONT.bold).fontSize(8)
      .text(label, x, y, { characterSpacing: 2, width: 80 });
    doc.fillColor(COLOR.ink).font(FONT.bold).fontSize(14)
      .text(value, x + 80, y - 3, { width: w - 80 });
    return y + 22;
  }

  private drawReservaYAsientos(doc: PDFKit.PDFDocument, input: PdfReservaInput, y: number): number {
    this.drawDashedSeparator(doc, y - 12);

    doc.fillColor(COLOR.meta).font(FONT.bold).fontSize(8)
      .text('NÚMERO DE RESERVA', COL_X, y, { characterSpacing: 2 });
    doc.fillColor(COLOR.ink).font(FONT.black).fontSize(24)
      .text(input.numero_reserva, COL_X, y + 14);

    const asX = COL_X + 260;
    doc.fillColor(COLOR.meta).font(FONT.bold).fontSize(8)
      .text('ASIENTOS', asX, y, { characterSpacing: 2 });

    let cx = asX;
    const cy = y + 14;
    const size = 36;
    const gap = 8;
    for (const asiento of input.asientos) {
      doc.roundedRect(cx, cy, size, size, 6).fill(COLOR.red);
      doc.fillColor(COLOR.white).font(FONT.bold).fontSize(13)
        .text(asiento.codigo, cx, cy + 10, { width: size, align: 'center' });
      cx += size + gap;
    }
    return y + 60;
  }

  private drawQrYResumen(doc: PDFKit.PDFDocument, input: PdfReservaInput, qr: Buffer, y: number): number {
    const qrSize = 130;
    doc.image(qr, COL_X, y, { width: qrSize, height: qrSize });

    doc.fillColor(COLOR.red).font(FONT.bold).fontSize(9)
      .text('ESCANEA', COL_X, y + qrSize + 8, { characterSpacing: 2 });
    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(10)
      .text('Presenta esto en taquilla o abre tu boleto desde otro teléfono.',
        COL_X, y + qrSize + 22, { width: qrSize + 10 });

    const rX = COL_X + qrSize + 40;
    const rW = COL_W - qrSize - 40;
    doc.fillColor(COLOR.meta).font(FONT.bold).fontSize(8)
      .text('RESUMEN DE PAGO', rX, y, { characterSpacing: 2 });

    let rY = y + 18;
    this.drawMontoRow(doc, rX, rW, rY, 'Subtotal', this.fmtMoney(input.pago.subtotal), COLOR.ink);
    rY += 18;
    if (input.pago.descuento > 0) {
      this.drawMontoRow(doc, rX, rW, rY, 'Descuento', `- ${this.fmtMoney(input.pago.descuento)}`, COLOR.orange);
      rY += 18;
    }
    doc.moveTo(rX, rY + 2).lineTo(rX + rW, rY + 2)
      .lineWidth(0.5).strokeColor(COLOR.meta).stroke();
    rY += 10;
    doc.fillColor(COLOR.meta).font(FONT.semibold).fontSize(10).text('TOTAL', rX, rY);
    doc.fillColor(COLOR.red).font(FONT.black).fontSize(18)
      .text(this.fmtMoney(input.pago.total), rX, rY - 4, { width: rW, align: 'right' });

    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(10)
      .text(input.pago.metodo_label, rX, rY + 24, { width: rW });

    return y + qrSize + 40;
  }

  private drawMontoRow(doc: PDFKit.PDFDocument, x: number, w: number, y: number, label: string, value: string, valueColor: string) {
    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(11).text(label, x, y);
    doc.fillColor(valueColor).font(FONT.medium).fontSize(11)
      .text(value, x, y, { width: w, align: 'right' });
  }

  private drawPerforacion(doc: PDFKit.PDFDocument, y: number): number {
    this.drawDashedSeparator(doc, y);
    const pillW = 50;
    const pillX = (PAGE_W - pillW) / 2;
    doc.roundedRect(pillX, y - 8, pillW, 16, 8).fill(COLOR.white);
    doc.fillColor(COLOR.red).font(FONT.bold).fontSize(8)
      .text('STUB', pillX, y - 3, { width: pillW, align: 'center', characterSpacing: 2 });
    return y + 16;
  }

  private drawStub(doc: PDFKit.PDFDocument, input: PdfReservaInput, qr: Buffer, y: number): number {
    const h = 90;
    doc.rect(0, y, PAGE_W, h).fill(COLOR.surface);

    doc.image(qr, COL_X, y + 16, { width: 56, height: 56 });

    const tX = COL_X + 72;
    doc.fillColor(COLOR.ink).font(FONT.bold).fontSize(14).text(input.numero_reserva, tX, y + 16);
    doc.fillColor(COLOR.ink).font(FONT.semibold).fontSize(12).text(input.pelicula.titulo, tX, y + 36, {
      width: COL_W - 72 - 20,
    });
    const codes = input.asientos.map(a => a.codigo).join(' ');
    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(10)
      .text(`Sala ${input.sala.nombre} · ${codes} · ${this.fmtFecha(input.funcion.fecha_hora)}`,
        tX, y + 56, { width: COL_W - 72 - 20 });

    doc.save();
    doc.translate(PAGE_W - 28, y + h - 20).rotate(-90);
    doc.fillColor(COLOR.red).font(FONT.bold).fontSize(9)
      .text('CINETICKETS', 0, 0, { characterSpacing: 3 });
    doc.restore();

    return y + h;
  }

  private drawFooter(doc: PDFKit.PDFDocument, y: number) {
    doc.fillColor(COLOR.meta).font(FONT.medium).fontSize(9)
      .text('Llega 15 min antes · Sin cambios tras inicio de la función',
        COL_X, y, { width: COL_W, align: 'center' });
    doc.text('© 2026 CineTickets', COL_X, y + 14, { width: COL_W, align: 'center' });
  }

  private drawDashedSeparator(doc: PDFKit.PDFDocument, y: number) {
    doc.lineWidth(0.5).strokeColor('#e0d8d8').dash(3, { space: 4 })
      .moveTo(COL_X, y).lineTo(COL_X + COL_W, y).stroke().undash();
  }

  private fmtMoney(n: number): string {
    return `L ${n.toFixed(2)}`;
  }

  private fmtFecha(d: Date): string {
    return new Intl.DateTimeFormat('es', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Tegucigalpa',
    }).format(d);
  }
}

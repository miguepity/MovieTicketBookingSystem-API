import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { BoletoCodeService } from './boleto-code.service';
import { BoletosPdfService, PdfReservaInput } from './boletos-pdf.service';

@ApiTags('boletos-publico')
@Controller('boletos')
export class BoletosController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codes: BoletoCodeService,
    private readonly pdf: BoletosPdfService,
  ) {}

  @Get(':codigoFirmado.pdf')
  @ApiOperation({ summary: 'PDF público del boleto (firmado por HMAC)' })
  async getPdf(
    @Param('codigoFirmado') codigoFirmado: string,
    @Query('download') download: string | undefined,
    @Res() res: Response,
  ) {
    const numero = this.codes.verificar(codigoFirmado);
    if (!numero) throw new NotFoundException('Boleto no encontrado');

    const reserva = await this.prisma.reservas.findUnique({
      where: { numero_reserva: numero },
      include: {
        usuarios: { select: { nombre: true } },
        funciones: {
          include: {
            peliculas: { select: { titulo: true, poster_url: true, duracion_min: true, idiomas: { select: { nombre: true } } } },
            salas: { include: { cines: { select: { nombre: true } } } },
          },
        },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: { include: { tipoAsiento: { select: { nombre: true } } } } } } },
        },
        pagos: { where: { estado: 'exitoso' }, orderBy: { created_at: 'desc' }, take: 1 },
      },
    });

    if (!reserva || reserva.estado !== EstadoReserva.PAGADA) {
      throw new NotFoundException('Boleto no encontrado');
    }

    const pago = reserva.pagos[0];
    const input: PdfReservaInput = {
      numero_reserva: reserva.numero_reserva,
      pelicula: {
        titulo: reserva.funciones.peliculas.titulo,
        poster_url: reserva.funciones.peliculas.poster_url,
        duracion_min: reserva.funciones.peliculas.duracion_min,
        idioma: reserva.funciones.peliculas.idiomas?.nombre ?? null,
      },
      cine: { nombre: reserva.funciones.salas.cines.nombre },
      sala: { nombre: reserva.funciones.salas.nombre, formato: null },
      funcion: { fecha_hora: reserva.funciones.fecha_hora },
      asientos: reserva.reservaAsientos.map((ra) => ({
        codigo: ra.asientosfuncion.asientos.codigo,
        tipo: ra.asientosfuncion.asientos.tipoAsiento.nombre,
      })),
      pago: {
        subtotal: pago ? Number(pago.monto_original) : 0,
        descuento: pago ? Number(pago.monto_descuento) : 0,
        total: pago ? Number(pago.monto_final) : 0,
        metodo_label: this.metodoLabel(pago),
      },
    };

    const buffer = await this.pdf.generar(input);
    const disposition = download ? 'attachment' : 'inline';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="boleto-${numero}.pdf"`);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.send(buffer);
  }

  private metodoLabel(pago: { metodo: string; marca_snapshot: string | null; ultimos4_snapshot: string | null } | undefined): string {
    if (!pago) return 'Pago confirmado';
    if (pago.metodo !== 'tarjeta') return 'Efectivo en taquilla';
    const marca = { visa: 'Visa', master: 'Mastercard', amex: 'Amex', discover: 'Discover' }[pago.marca_snapshot ?? ''] ?? 'Tarjeta';
    return `${marca} **** ${pago.ultimos4_snapshot ?? '----'}`;
  }
}

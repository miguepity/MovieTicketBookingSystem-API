import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';
import { ConfirmacionEmailDto } from './dto/confirmacion-email.dto';
import { CancelacionEmailDto } from './dto/cancelacion-email.dto';
import { NuevaPeliculaEmailDto } from './dto/nueva-pelicula-email.dto';
import { FuncionCanceladaEmailDto } from './dto/funcion-cancelada-email.dto';

export interface SendMailOptions {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client: BrevoClient;

  constructor() {
    this.client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }

  async sendEmail(options: SendMailOptions): Promise<void> {
    try {
      await this.client.transactionalEmails.sendTransacEmail({
        to: [options.to],
        sender: {
          email: process.env.BREVO_SENDER_EMAIL ?? 'no-reply@movietickets.com',
          name: process.env.BREVO_SENDER_NAME ?? 'Movie Ticket Booking',
        },
        subject: options.subject,
        htmlContent: options.htmlContent,
      });
    } catch (error) {
      this.logger.error(`Error al enviar email a ${options.to.email}`, error);
      throw new InternalServerErrorException('Error al enviar el email');
    }
  }

  async sendConfirmacionEmail(input: ConfirmacionEmailDto): Promise<void> {
    const asientosFilas = input.asientos
      .map(
        (a) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${a.codigo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-transform:capitalize;">${a.tipo.toLowerCase()}</td>
        </tr>`,
      )
      .join('');

    const descuentoFila =
      parseFloat(input.montoDescuento) > 0
        ? `<tr>
            <td style="padding:6px 16px;color:#555;font-size:14px;">Descuento:</td>
            <td style="padding:6px 16px;text-align:right;font-size:14px;color:#27ae60;">-$${input.montoDescuento}</td>
          </tr>`
        : '';

    const metodoLabel =
      input.metodo.toLowerCase() === 'tarjeta' ? 'Tarjeta' : 'Efectivo';

    const year = new Date().getFullYear();

    await this.sendEmail({
      to: { email: input.email, name: input.nombre },
      subject: `Confirmación de reserva ${input.numeroReserva} — ${input.pelicula}`,
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#e50914;padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🎬 CineTickets</h1>
            <p style="color:#ffcccc;margin:8px 0 0;font-size:14px;">Tu entrada está confirmada</p>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px 10px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;font-size:20px;">¡Reserva confirmada, ${input.nombre}!</h2>
            <p style="color:#555;margin:0;font-size:15px;">Gracias por tu compra. Aquí están los detalles de tu reserva.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;">
            <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:12px 16px;display:inline-block;">
              <span style="font-size:13px;color:#888;">Número de reserva</span><br>
              <strong style="font-size:20px;color:#1a1a1a;letter-spacing:2px;">${input.numeroReserva}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">PELÍCULA</span>
                  <strong style="font-size:16px;color:#1a1a1a;">${input.pelicula}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">CINE</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.cine}</strong>
                </td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;">
                  <span style="font-size:12px;color:#888;display:block;">FECHA Y HORA</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.fechaFuncion}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;">Asientos reservados</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;border-bottom:1px solid #eee;">CÓDIGO</th>
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;border-bottom:1px solid #eee;">TIPO</th>
              </tr>
              ${asientosFilas}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 30px;">
            <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;">Resumen de pago</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;background:#fafafa;">
              <tr>
                <td style="padding:6px 16px;color:#555;font-size:14px;">Subtotal:</td>
                <td style="padding:6px 16px;text-align:right;font-size:14px;color:#1a1a1a;">$${input.montoOriginal}</td>
              </tr>
              ${descuentoFila}
              <tr style="border-top:2px solid #eee;">
                <td style="padding:10px 16px;font-weight:bold;font-size:16px;color:#1a1a1a;">Total pagado:</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;font-size:16px;color:#e50914;">$${input.montoFinal}</td>
              </tr>
              <tr>
                <td style="padding:4px 16px 10px;color:#888;font-size:13px;">Método:</td>
                <td style="padding:4px 16px 10px;text-align:right;font-size:13px;color:#555;">${metodoLabel}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
            <p style="color:#888;font-size:13px;margin:0;">Este correo fue generado automáticamente. Por favor no respondas a este mensaje.</p>
            <p style="color:#555;font-size:12px;margin:8px 0 0;">© ${year} CineTickets — Todos los derechos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  async sendCancelacionEmail(input: CancelacionEmailDto): Promise<void> {
    const asientosFilas = input.asientos
      .map(
        (a) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${a.codigo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-transform:capitalize;">${a.tipo.toLowerCase()}</td>
        </tr>`,
      )
      .join('');

    const estadoColors: Record<string, string> = {
      pendiente: '#f39c12',
      aprobado: '#27ae60',
      rechazado: '#e74c3c',
      sin_reembolso: '#888',
    };
    const estadoLabels: Record<string, string> = {
      pendiente: 'Reembolso pendiente',
      aprobado: 'Reembolso aprobado',
      rechazado: 'Reembolso rechazado',
      sin_reembolso: 'Sin reembolso',
    };

    const estadoKey = input.estadoReembolso in estadoColors
      ? input.estadoReembolso
      : 'sin_reembolso';
    const color = estadoColors[estadoKey];
    const label = estadoLabels[estadoKey];

    const reembolsoSection =
      estadoKey !== 'sin_reembolso'
        ? `<tr>
            <td style="padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;background:#fafafa;">
                <tr>
                  <td style="padding:16px;">
                    <span style="font-size:12px;color:#888;display:block;margin-bottom:6px;">ESTADO DEL REEMBOLSO</span>
                    <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:bold;color:${color};background:${color}22;">
                      ${label}
                    </span>
                    ${
                      input.montoReembolso
                        ? `<p style="margin:10px 0 0;font-size:14px;color:#555;">
                            Monto del reembolso: <strong style="color:#1a1a1a;">$${input.montoReembolso}</strong>
                          </p>`
                        : ''
                    }
                    ${
                      estadoKey === 'pendiente'
                        ? `<p style="margin:8px 0 0;font-size:13px;color:#888;">
                            Procesaremos tu reembolso en los próximos días hábiles.
                          </p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
        : '';

    const montoPagadoFila = input.montoPagado
      ? `<tr>
          <td style="padding:10px 16px;color:#555;font-size:14px;">Monto pagado:</td>
          <td style="padding:10px 16px;text-align:right;font-size:14px;color:#1a1a1a;">$${input.montoPagado}</td>
        </tr>`
      : '';

    const year = new Date().getFullYear();

    await this.sendEmail({
      to: { email: input.email, name: input.nombre },
      subject: `Cancelación de reserva ${input.numeroReserva} — ${input.pelicula}`,
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#333;padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🎬 CineTickets</h1>
            <p style="color:#aaa;margin:8px 0 0;font-size:14px;">Cancelación de reserva</p>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px 10px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;font-size:20px;">Hola, ${input.nombre}</h2>
            <p style="color:#555;margin:0;font-size:15px;">Tu reserva ha sido cancelada. A continuación encontrarás el detalle.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;">
            <div style="background:#fafafa;border:1px solid #ddd;border-radius:6px;padding:12px 16px;display:inline-block;">
              <span style="font-size:13px;color:#888;">Número de reserva</span><br>
              <strong style="font-size:20px;color:#333;letter-spacing:2px;">${input.numeroReserva}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">PELÍCULA</span>
                  <strong style="font-size:16px;color:#1a1a1a;">${input.pelicula}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">CINE</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.cine}</strong>
                </td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;">
                  <span style="font-size:12px;color:#888;display:block;">FECHA Y HORA</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.fechaFuncion}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;">Asientos cancelados</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;border-bottom:1px solid #eee;">CÓDIGO</th>
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;border-bottom:1px solid #eee;">TIPO</th>
              </tr>
              ${asientosFilas}
            </table>
          </td>
        </tr>
        ${
          input.montoPagado
            ? `<tr>
                <td style="padding:0 40px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;background:#fafafa;">
                    ${montoPagadoFila}
                  </table>
                </td>
              </tr>`
            : ''
        }
        ${reembolsoSection}
        <tr>
          <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
            <p style="color:#888;font-size:13px;margin:0;">Este correo fue generado automáticamente. Por favor no respondas a este mensaje.</p>
            <p style="color:#555;font-size:12px;margin:8px 0 0;">© ${year} CineTickets — Todos los derechos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  async sendNuevaPeliculaEmail(input: NuevaPeliculaEmailDto): Promise<void> {
    const posterSection = input.posterUrl
      ? `<tr>
          <td style="padding:0 40px 20px;text-align:center;">
            <img src="${input.posterUrl}" alt="Póster de ${input.titulo}"
              style="max-width:200px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
          </td>
        </tr>`
      : '';

    const year = new Date().getFullYear();

    await this.sendEmail({
      to: { email: input.email, name: input.nombre },
      subject: `¡Nueva película! ${input.titulo} ya está en CineTickets`,
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#e50914;padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🎬 CineTickets</h1>
            <p style="color:#ffcccc;margin:8px 0 0;font-size:14px;">¡Nueva película disponible!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px 20px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;font-size:20px;">¡Hola, ${input.nombre}!</h2>
            <p style="color:#555;margin:0;font-size:15px;">Tenemos una nueva película en cartelera que creemos te va a encantar.</p>
          </td>
        </tr>
        ${posterSection}
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <td style="padding:20px 16px;text-align:center;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;margin-bottom:4px;">TÍTULO</span>
                  <strong style="font-size:22px;color:#1a1a1a;">${input.titulo}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">GÉNERO</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.genero}</strong>
                </td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;">
                  <span style="font-size:12px;color:#888;display:block;">FECHA DE ESTRENO</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.fechaEstreno}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;text-align:center;">
            <a href="${input.link}"
              style="display:inline-block;padding:14px 32px;background:#e50914;color:#fff;
                     text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;">
              Ver más información
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">
              Recibes este correo porque tienes activadas las notificaciones de nuevas películas.<br>
              Puedes desactivarlas desde la configuración de tu cuenta.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
            <p style="color:#888;font-size:13px;margin:0;">Este correo fue generado automáticamente. Por favor no respondas a este mensaje.</p>
            <p style="color:#555;font-size:12px;margin:8px 0 0;">© ${year} CineTickets — Todos los derechos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  async sendFuncionCanceladaEmail(input: FuncionCanceladaEmailDto): Promise<void> {
    const year = new Date().getFullYear();

    const reembolsoSection = input.tienePagoAprobado
      ? `<tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f39c12;border-radius:6px;overflow:hidden;background:#fffbf0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 10px;font-size:15px;font-weight:bold;color:#b7770d;">💳 Información sobre tu reembolso</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#555;">
                    Monto a reembolsar: <strong style="color:#1a1a1a;">$${input.montoPagado}</strong>
                  </p>
                  <p style="margin:0 0 6px;font-size:14px;color:#555;">Para gestionar tu reembolso, sigue estos pasos:</p>
                  <ol style="margin:8px 0 0;padding-left:20px;color:#555;font-size:14px;line-height:1.8;">
                    <li>Inicia sesión en tu cuenta de CineTickets.</li>
                    <li>Dirígete a <strong>Mis Reservas</strong> y localiza la reserva cancelada.</li>
                    <li>Selecciona la opción <strong>Solicitar reembolso</strong>.</li>
                    <li>El reembolso será procesado en un plazo de <strong>5 a 10 días hábiles</strong>.</li>
                  </ol>
                  <p style="margin:12px 0 0;font-size:13px;color:#888;">
                    Si tienes dudas, contáctanos en <a href="mailto:soporte@cinetickets.com" style="color:#e50914;">soporte@cinetickets.com</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
      : `<tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;background:#fafafa;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;color:#555;">Tu reserva aún no había sido pagada, por lo que no se generará ningún cargo.</p>
                  <p style="margin:0;font-size:14px;color:#555;">Los asientos han sido liberados y puedes hacer una nueva reserva cuando quieras.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;

    await this.sendEmail({
      to: { email: input.email, name: input.nombre },
      subject: `Función cancelada — ${input.pelicula}`,
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#333;padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🎬 CineTickets</h1>
            <p style="color:#aaa;margin:8px 0 0;font-size:14px;">Función cancelada</p>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px 10px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;font-size:20px;">Hola, ${input.nombre}</h2>
            <p style="color:#555;margin:0;font-size:15px;">
              Lamentamos informarte que la siguiente función ha sido cancelada.
              Tu reserva ha sido anulada automáticamente.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;">
            <div style="background:#fafafa;border:1px solid #ddd;border-radius:6px;padding:12px 16px;display:inline-block;">
              <span style="font-size:13px;color:#888;">Número de reserva</span><br>
              <strong style="font-size:20px;color:#333;letter-spacing:2px;">${input.numeroReserva}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">PELÍCULA</span>
                  <strong style="font-size:16px;color:#1a1a1a;">${input.pelicula}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;">
                  <span style="font-size:12px;color:#888;display:block;">CINE</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.cine}</strong>
                </td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:14px 16px;">
                  <span style="font-size:12px;color:#888;display:block;">FECHA Y HORA</span>
                  <strong style="font-size:15px;color:#1a1a1a;">${input.fechaFuncion}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${reembolsoSection}
        <tr>
          <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
            <p style="color:#888;font-size:13px;margin:0;">Este correo fue generado automáticamente. Por favor no respondas a este mensaje.</p>
            <p style="color:#555;font-size:12px;margin:8px 0 0;">© ${year} CineTickets — Todos los derechos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }
}

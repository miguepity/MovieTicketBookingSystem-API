import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendCancelacionFuncion(
    to: string,
    nombre: string,
    tituloPelicula: string,
    fechaHora: Date,
    numeroReserva: string,
  ): Promise<void> {
    const fechaFormateada = fechaHora.toLocaleString('es-AR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@movieticketing.com',
      to,
      subject: `Función cancelada: ${tituloPelicula}`,
      html: `
        <h2>Hola, ${nombre}</h2>
        <p>
          Lamentamos informarte que la función de <strong>${tituloPelicula}</strong>
          programada para el <strong>${fechaFormateada}</strong> ha sido <strong>cancelada</strong>.
        </p>
        <p>Tu reserva <strong>#${numeroReserva}</strong> ha sido cancelada automáticamente.</p>
        <p>Si realizaste un pago, recibirás el reembolso correspondiente en los próximos días hábiles.</p>
        <br/>
        <p>Disculpa los inconvenientes ocasionados.</p>
        <p><em>El equipo de MovieTicket</em></p>
      `,
    });
  }
}

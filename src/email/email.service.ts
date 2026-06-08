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
  async sendPagoExitoso(
    to: string,
    nombre: string,
    numeroReserva: string,
    tituloPelicula: string,
    fechaHora: Date,
    montoFinal: string,
  ): Promise<void> {
    const fechaFormateada = fechaHora.toLocaleString('es-AR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@movieticketing.com',
      to,
      subject: `Confirmación de pago: ${tituloPelicula}`,
      html: `
      <h2>Hola, ${nombre}</h2>
      <p>Tu pago fue procesado exitosamente.</p>
      <table>
        <tr><td><strong>Reserva:</strong></td><td>#${numeroReserva}</td></tr>
        <tr><td><strong>Película:</strong></td><td>${tituloPelicula}</td></tr>
        <tr><td><strong>Fecha:</strong></td><td>${fechaFormateada}</td></tr>
        <tr><td><strong>Total pagado:</strong></td><td>$${montoFinal}</td></tr>
      </table>
      <br/>
      <p>¡Disfruta la función!</p>
      <p><em>El equipo de MovieTicket</em></p>
    `,
    });
  }

  async sendNuevaPelicula(
    to: string,
    nombre: string,
    tituloPelicula: string,
    genero: string,
    fechaEstreno: Date,
    linkDetalle: string,
  ): Promise<void> {
    const fechaFormateada = fechaEstreno.toLocaleDateString('es-AR', {
      dateStyle: 'full',
    });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@movieticketing.com',
      to,
      subject: `Nueva película disponible: ${tituloPelicula}`,
      html: `
      <h2>Hola, ${nombre}</h2>
      <p>¡Hay una nueva película en cartelera!</p>
      <table>
        <tr><td><strong>Título:</strong></td><td>${tituloPelicula}</td></tr>
        <tr><td><strong>Género:</strong></td><td>${genero}</td></tr>
        <tr><td><strong>Fecha de estreno:</strong></td><td>${fechaFormateada}</td></tr>
      </table>
      <br/>
      <a href="${linkDetalle}" style="padding: 10px 20px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px;">
        Ver detalles
      </a>
      <br/><br/>
      <p><em>El equipo de MovieTicket</em></p>
    `,
    });
  }
}

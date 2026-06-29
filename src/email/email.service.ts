import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import emailjs from '@emailjs/nodejs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // 1. Configuración existente de Nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Nueva configuración de EmailJS
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    });
  }

  // --- NUEVO MÉTODO: Envío de código con EmailJS ---
  async sendActivationCode(toEmail: string, token: string): Promise<void> {
    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: toEmail,
          message: `Tu codigo de activacion es: ${token}`,
        },
      );
      this.logger.log(`Código de activación enviado a ${toEmail} vía EmailJS`);
    } catch (error) {
      this.logger.error('Error al enviar correo con EmailJS:', error);
      throw new InternalServerErrorException(
        'Error al enviar el correo de activación',
      );
    }
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

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: to,
          message: `Hola, ${nombre}. ¡Hay una nueva película en cartelera! Título: ${tituloPelicula} | Género: ${genero} | Estreno: ${fechaFormateada}. Ver detalles: ${linkDetalle}`,
        },
      );
      this.logger.log(`Correo de nueva película enviado a ${to} vía EmailJS`);
    } catch (error) {
      this.logger.error(
        'Error al enviar correo de nueva película con EmailJS:',
        error,
      );
      throw error;
    }
  }

  async sendPasswordReset(
    to: string,
    nombre: string,
    resetLink: string,
  ): Promise<void> {
    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: to,
          message: `Hola, ${nombre}. Solicitaste restablecer tu contraseña. Usa el siguiente enlace (válido por 1 hora): ${resetLink} — Si no solicitaste esto, puedes ignorar este correo.`,
        },
      );
      this.logger.log(`Correo de recuperación enviado a ${to} vía EmailJS`);
    } catch (error) {
      this.logger.error(
        'Error al enviar correo de recuperación con EmailJS:',
        error,
      );
      throw new InternalServerErrorException(
        'Error al enviar el correo de recuperación de contraseña',
      );
    }
  }

  async sendNotificacionGeneral(
    to: string,
    nombre: string,
    subject: string,
    message: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@movieticketing.com',
      to,
      subject,
      html: `
        <h2>Hola, ${nombre}</h2>
        <p>${message}</p>
        <p><em>El equipo de MovieTicket</em></p>
      `,
    });
  }
}

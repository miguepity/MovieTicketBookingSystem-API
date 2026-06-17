import { Injectable } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private client: BrevoClient;

  private senderEmail: string;

  constructor() {
    const key = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    if (!key || !senderEmail)
      throw new Error(
        'BREVO_API_KEY o BREVO_SENDER_EMAIL no están definidos en las variables de entorno',
      );

    this.senderEmail = senderEmail;
    this.client = new BrevoClient({
      apiKey: key,
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    console.log('Enviando correo a:', to);
    console.log('Asunto:', subject);
    console.log('...');

    try {
      const result = await this.client.transactionalEmails.sendTransacEmail({
        subject: subject,
        htmlContent: html,
        sender: { name: 'MovieSys', email: this.senderEmail },
        to: [{ email: to, name: to.split('@')[0] }],
      });

      console.log('Email sent. Message ID:', result.messageId);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('No se pudo enviar el correo');
    }
  }

  async sendNewMovieNotification(
    to: string,
    userName: string,
    movie: {
      titulo: string;
      genero: string;
      fecha_estreno: string;
      id: string;
    },
  ) {
    const movieUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/movies/${movie.id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h1 style="color: #e50914; text-align: center;">¡Nueva Película en MovieSys!</h1>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tenemos un nuevo estreno que no te puedes perder:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #e50914; margin: 20px 0;">
          <h2 style="margin-top: 0;">${movie.titulo}</h2>
          <p><strong>Género:</strong> ${movie.genero}</p>
          <p><strong>Fecha de Estreno:</strong> ${movie.fecha_estreno}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${movieUrl}" style="background-color: #e50914; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Funciones</a>
        </div>
        <p style="font-size: 12px; color: #777; margin-top: 40px; text-align: center;">
          Recibes este correo porque tienes activadas las notificaciones de estrenos. 
          Si deseas dejar de recibirlas, puedes cambiar tu configuración en tu perfil.
        </p>
      </div>
    `;

    await this.sendEmail(to, `¡Estreno! - ${movie.titulo}`, html);
  }
}

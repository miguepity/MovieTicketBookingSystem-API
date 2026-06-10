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
}

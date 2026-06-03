import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

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
}

import { Injectable } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

@Injectable()
export class MailService {
  private domain: string;
  private client: MailerSend;

  constructor() {
    const domain = process.env.MAILSEND_DOMAIN;
    const key = process.env.MAILSEND_API_KEY;

    if (!key || !domain)
      throw new Error(
        'MAILSEND_API_KEY o MAILSEND_DOMAIN no están definidos en las variables de entorno',
      );

    this.domain = domain;
    this.client = new MailerSend({
      apiKey: process.env.MAILSEND_API_KEY || '',
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const recipient = new Recipient(to);
    const sentFrom = new Sender(`no-reply@${this.domain}`, 'MovieSys');

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo([recipient])
      .setSubject(subject)
      .setHtml(html);

    await this.client.email.send(emailParams);
  }
}

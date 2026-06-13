import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { buildPasswordResetTemplate } from './templates/password-reset.template';

const DEFAULT_MAIL_PORT = 1025;

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendEmail(options: SendEmailOptions) {
    try {
      const transporter = this.createTransporter();

      await transporter.sendMail({
        from: process.env.MAIL_FROM ?? 'Movie Tickets <no-reply@localhost>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error('Could not send email', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo',
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = this.buildResetUrl(token);

    await this.sendEmail({
      to: email,
      subject: 'Restablece tu contrasena',
      html: buildPasswordResetTemplate(resetUrl),
    });
  }

  private createTransporter() {
    const mailUser = process.env.MAIL_USER;
    const mailPassword = process.env.MAIL_PASSWORD;

    return createTransport({
      host: process.env.MAIL_HOST ?? 'localhost',
      port: Number(process.env.MAIL_PORT ?? DEFAULT_MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth:
        mailUser && mailPassword
          ? {
              user: mailUser,
              pass: mailPassword,
            }
          : undefined,
    });
  }

  private buildResetUrl(token: string) {
    const baseUrl =
      process.env.PASSWORD_RESET_URL ?? 'http://localhost:3000/reset-password';
    const url = new URL(baseUrl);

    url.searchParams.set('token', token);

    return url.toString();
  }
}

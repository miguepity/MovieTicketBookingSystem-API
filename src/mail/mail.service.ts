import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';

const DEFAULT_MAIL_PORT = 1025;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = this.buildResetUrl(token);
    const recipient = process.env.MAIL_TEST_TO ?? email;

    try {
      const mailUser = process.env.MAIL_USER;
      const mailPassword = process.env.MAIL_PASSWORD;
      const transporter = createTransport({
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

      await transporter.sendMail({
        from: process.env.MAIL_FROM ?? 'Movie Tickets <no-reply@localhost>',
        to: recipient,
        subject: 'Restablece tu contrasena',
        html: this.buildPasswordResetHtml(resetUrl),
      });

      this.logger.log(`Password reset email sent to ${recipient}`);
    } catch (error) {
      this.logger.error('Could not send password reset email', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperacion',
      );
    }
  }

  private buildResetUrl(token: string) {
    const baseUrl =
      process.env.PASSWORD_RESET_URL ?? 'http://localhost:3000/reset-password';
    const url = new URL(baseUrl);

    url.searchParams.set('token', token);

    return url.toString();
  }

  private buildPasswordResetHtml(resetUrl: string) {
    return `
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>Usa este enlace para continuar:</p>
      <p><a href="${resetUrl}">Restablecer contrasena</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `;
  }
}

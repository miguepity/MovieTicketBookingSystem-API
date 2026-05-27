import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

type ResendEmailResponse = {
  id?: string;
  message?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = this.buildResetUrl(token);
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.log(`Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? 'Movie Tickets <onboarding@resend.dev>',
        to: email,
        subject: 'Restablece tu contrasena',
        html: this.buildPasswordResetHtml(resetUrl),
      }),
    });

    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => null)) as ResendEmailResponse | null;
      this.logger.error(
        `Could not send password reset email: ${
          body?.message ?? response.statusText
        }`,
      );
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

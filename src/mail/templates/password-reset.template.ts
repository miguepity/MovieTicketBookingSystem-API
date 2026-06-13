export function buildPasswordResetTemplate(resetUrl: string) {
  return `
    <p>Recibimos una solicitud para restablecer tu contrasena.</p>
    <p>Usa este enlace para continuar:</p>
    <p><a href="${resetUrl}">Restablecer contrasena</a></p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
  `;
}

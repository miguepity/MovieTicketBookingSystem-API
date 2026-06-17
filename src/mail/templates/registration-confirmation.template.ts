type RegistrationConfirmationTemplateData = {
  name: string;
  email: string;
};

export function buildRegistrationConfirmationTemplate(
  data: RegistrationConfirmationTemplateData,
) {
  return `
    <p>Hola ${data.name},</p>
    <p>Tu cuenta en Movie Tickets fue creada correctamente.</p>
    <p>Correo registrado: ${data.email}</p>
    <p>Ya puedes iniciar sesion y gestionar tus reservas.</p>
  `;
}

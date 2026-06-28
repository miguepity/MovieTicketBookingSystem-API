type CancelledFunctionTemplateData = {
  reservationNumber: string;
  movieTitle: string;
  cinemaName: string;
  functionDate: Date | string;
  refundInstructions: string;
};

export function buildCancelledFunctionTemplate(
  data: CancelledFunctionTemplateData,
) {
  const date = new Date(data.functionDate);

  // Obtenemos los componentes en UTC directamente para no aplicar offsets locales
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  
  // Obtenemos horas y minutos en UTC
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  const functionDate = `${day}/${month}/${year} ${hours}:${minutes} `;

  return `
    <p>La funcion asociada a tu reserva fue cancelada.</p>
    <p><strong>Numero de reserva:</strong> ${data.reservationNumber}</p>
    <p><strong>Pelicula:</strong> ${data.movieTitle}</p>
    <p><strong>Cine:</strong> ${data.cinemaName}</p>
    <p><strong>Fecha y hora:</strong> ${functionDate}</p>
    <p><strong>Instrucciones de reembolso:</strong> ${data.refundInstructions}</p>
  `;
}


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
  const functionDate = new Date(data.functionDate).toLocaleString('es-HN');

  return `
    <p>La funcion asociada a tu reserva fue cancelada.</p>
    <p><strong>Numero de reserva:</strong> ${data.reservationNumber}</p>
    <p><strong>Pelicula:</strong> ${data.movieTitle}</p>
    <p><strong>Cine:</strong> ${data.cinemaName}</p>
    <p><strong>Fecha y hora:</strong> ${functionDate}</p>
    <p><strong>Instrucciones de reembolso:</strong> ${data.refundInstructions}</p>
  `;
}

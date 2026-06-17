type ReservationCancellationTemplateData = {
  reservationNumber: string;
  movieTitle: string;
  cinemaName: string;
  refundStatus: string;
  refundAmount?: string | number;
};

export function buildReservationCancellationTemplate(
  data: ReservationCancellationTemplateData,
) {
  const refundAmount = data.refundAmount
    ? `<p><strong>Monto de reembolso:</strong> ${data.refundAmount}</p>`
    : '';

  return `
    <p>Tu reserva fue cancelada correctamente.</p>
    <p><strong>Numero de reserva:</strong> ${data.reservationNumber}</p>
    <p><strong>Pelicula:</strong> ${data.movieTitle}</p>
    <p><strong>Cine:</strong> ${data.cinemaName}</p>
    <p><strong>Estado de reembolso:</strong> ${data.refundStatus}</p>
    ${refundAmount}
    <p>Si tienes dudas, contacta al personal del cine.</p>
  `;
}

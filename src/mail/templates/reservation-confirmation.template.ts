type ReservationConfirmationTemplateData = {
  reservationNumber: string;
  movieTitle: string;
  cinemaName: string;
  seats: string[];
  amount: string | number;
};

export function buildReservationConfirmationTemplate(
  data: ReservationConfirmationTemplateData,
) {
  const seats = data.seats.length > 0 ? data.seats.join(', ') : 'No especificados';

  return `
    <p>Tu reserva fue confirmada exitosamente.</p>
    <p><strong>Numero de reserva:</strong> ${data.reservationNumber}</p>
    <p><strong>Pelicula:</strong> ${data.movieTitle}</p>
    <p><strong>Cine:</strong> ${data.cinemaName}</p>
    <p><strong>Asientos:</strong> ${seats}</p>
    <p><strong>Monto:</strong> ${data.amount}</p>
    <p>Gracias por comprar en Movie Tickets.</p>
  `;
}

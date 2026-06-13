type NewMovieTemplateData = {
  title: string;
  genre?: string | null;
  releaseDate?: Date | string | null;
  link?: string;
};

export function buildNewMovieTemplate(data: NewMovieTemplateData) {
  const releaseDate = data.releaseDate
    ? new Date(data.releaseDate).toLocaleDateString('es-HN')
    : 'Por confirmar';
  const genre = data.genre ?? 'No especificado';
  const link = data.link
    ? `<p><a href="${data.link}">Ver pelicula</a></p>`
    : '';

  return `
    <p>Tenemos una nueva pelicula disponible en Movie Tickets.</p>
    <p><strong>Titulo:</strong> ${data.title}</p>
    <p><strong>Genero:</strong> ${genre}</p>
    <p><strong>Fecha de estreno:</strong> ${releaseDate}</p>
    ${link}
  `;
}

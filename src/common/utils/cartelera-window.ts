export function finDeSemanaProxima(now: Date = new Date()): Date {
  const d = new Date(now);
  const diasHastaDomingo = (7 - d.getUTCDay()) % 7;
  d.setUTCDate(d.getUTCDate() + diasHastaDomingo);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function puedeReservar(fechaEstreno: Date | string | null | undefined): boolean {
  if (!fechaEstreno) return true;
  const estreno = fechaEstreno instanceof Date ? fechaEstreno : new Date(fechaEstreno);
  if (Number.isNaN(estreno.getTime())) return true;
  return estreno.getTime() <= finDeSemanaProxima().getTime();
}

import 'dotenv/config';
import { prisma } from './seed/client';
import { seedRoles } from './seed/roles';
import { seedCiudades } from './seed/ciudades';
import { seedIdiomas } from './seed/idiomas';
import { seedGeneros } from './seed/generos';
import { seedUsuarios } from './seed/usuarios';
import { seedCines } from './seed/cines';
import { seedSalas } from './seed/salas';
import { seedAsientos } from './seed/asientos';
import { seedPeliculas } from './seed/peliculas';
import { seedFunciones } from './seed/funciones';
import { seedAsientosFuncion } from './seed/asientos-funcion';
import { seedCupones } from './seed/cupones';
import { seedPoliticaCancelacion } from './seed/politica-cancelacion';
import { seedReservas } from './seed/reservas';
import { seedReservaAsientos } from './seed/reserva-asientos';
import { seedPagos } from './seed/pagos';
import { seedReembolsos } from './seed/reembolsos';
import { seedAuditLog } from './seed/audit-log';
import { seedPasswordResetTokens } from './seed/password-reset-token';

async function main() {
  const roles = await seedRoles();
  const ciudades = await seedCiudades();
  const idiomas = await seedIdiomas();
  const generos = await seedGeneros();
  await seedPoliticaCancelacion();
  const cupones = await seedCupones();
  const usuarios = await seedUsuarios(roles);
  const cines = await seedCines(ciudades);
  const salas = await seedSalas(cines);
  const asientos = await seedAsientos(salas);
  const peliculas = await seedPeliculas(idiomas, generos, usuarios.admin);
  const funciones = await seedFunciones(peliculas, salas);
  const asientosFuncion = await seedAsientosFuncion(asientos, funciones);
  const reservas = await seedReservas(usuarios, funciones);
  await seedReservaAsientos(reservas, asientosFuncion);
  const pagos = await seedPagos(reservas, cupones);
  await seedReembolsos(pagos);
  await seedAuditLog(usuarios);
  await seedPasswordResetTokens(usuarios);

  console.log('Seed completado:');
  console.log(`  Roles:                  ${Object.keys(roles).length}`);
  console.log(`  Ciudades:               ${Object.keys(ciudades).length}`);
  console.log(`  Idiomas:                ${Object.keys(idiomas).length}`);
  console.log(`  Géneros:                ${Object.keys(generos).length}`);
  console.log(`  Cupones:                ${cupones.all.length}`);
  console.log(`  Usuarios:               ${usuarios.all.length}`);
  console.log(`  Cines:                  ${cines.all.length}`);
  console.log(`  Salas:                  ${salas.all.length}`);
  console.log(
    `  Asientos:               ${Object.values(asientos.bySala).reduce(
      (acc, arr) => acc + arr.length,
      0,
    )}`,
  );
  console.log(`  Películas:              ${peliculas.all.length}`);
  console.log(`  Funciones:              ${funciones.all.length}`);
  console.log(`  Asientos por función:   ${asientosFuncion.all.length}`);
  console.log(`  Reservas:               ${reservas.all.length}`);
  console.log(`  Pagos:                  ${pagos.all.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

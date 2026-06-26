import {
  PrismaClient,
  Roles,
  Usuarios,
  Ciudades,
  Cines,
  Salas,
  Funciones,
  Peliculas,
  Idiomas,
  Generos,
  Cupones,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en el entorno.');
}

// Inicialización respetando el adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log('Iniciando el seeder...');

  // 1. Roles (5 registros)
  const roleNames = ['ADMIN', 'CLIENTE', 'RECEPCIONISTA', 'INVITADO'];
  const roles: Roles[] = [];
  for (const name of roleNames) {
    const role = await prisma.roles.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name },
    });
    roles.push(role);
  }

  // 2. Usuarios (5 registros)
  const passwordHash = await bcrypt.hash('password123', 10);
  const userEmails = [
    'admin@cine.com',
    'cliente1@cine.com',
    'cliente2@cine.com',
    'gerente@cine.com',
    'soporte@cine.com',
  ];
  const usuarios: Usuarios[] = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.usuarios.upsert({
      where: { email: userEmails[i] },
      update: {},
      create: {
        nombre: `Usuario ${i + 1}`,
        email: userEmails[i],
        password_hash: passwordHash,
        telefono: `123456789${i}`,
        id_rol: roles[i % roles.length].id,
        estado: 'ACTIVO',
      },
    });
    usuarios.push(user);
  }
  const adminUser = usuarios[0];

  // 3. Ciudades (5 registros)
  const ciudadNames = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
  const ciudades: Ciudades[] = [];
  for (const name of ciudadNames) {
    const ciudad = await prisma.ciudades.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name },
    });
    ciudades.push(ciudad);
  }

  // 4. Cines (5 registros)
  const cines: Cines[] = [];
  for (let i = 0; i < 5; i++) {
    let cine = await prisma.cines.findFirst({
      where: { nombre: `Cineplex ${ciudades[i].nombre}` },
    });
    if (!cine) {
      cine = await prisma.cines.create({
        data: {
          nombre: `Cineplex ${ciudades[i].nombre}`,
          direccion: `Calle Principal ${i + 1}`,
          id_ciudad: ciudades[i].id,
        },
      });
    }
    cines.push(cine);
  }

  // 5. Salas (5 registros) y 6. Asientos (25 por sala)
  const salas: Salas[] = [];
  for (let i = 0; i < 5; i++) {
    let sala = await prisma.salas.findFirst({
      where: { nombre: `Sala ${i + 1}`, id_cine: cines[i].id },
    });
    if (!sala) {
      sala = await prisma.salas.create({
        data: {
          nombre: `Sala ${i + 1}`,
          id_cine: cines[i].id,
          filas: 5,
          columnas: 5,
        },
      });

      // Crear 25 asientos para la sala
      const letras = ['A', 'B', 'C', 'D', 'E'];
      for (let f = 0; f < 5; f++) {
        for (let c = 1; c <= 5; c++) {
          await prisma.asientos.create({
            data: {
              id_sala: sala.id,
              fila: letras[f],
              columna: c,
              codigo: `${letras[f]}${c}`,
              tipo: 'ESTANDAR',
            },
          });
        }
      }
    }
    salas.push(sala);
  }

  // 7. Idiomas (5 registros)
  const idiomaNames = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano'];
  const idiomas: Idiomas[] = [];
  for (const name of idiomaNames) {
    const idioma = await prisma.idiomas.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name },
    });
    idiomas.push(idioma);
  }

  // 8. Generos (5 registros)
  const generoNames = [
    'Ciencia Ficción',
    'Acción',
    'Drama',
    'Comedia',
    'Terror',
  ];
  const generos: Generos[] = [];
  for (const name of generoNames) {
    const genero = await prisma.generos.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name },
    });
    generos.push(genero);
  }

  // 9. Peliculas (5 registros)
  const peliculas: Peliculas[] = [];
  for (let i = 0; i < 5; i++) {
    let pelicula = await prisma.peliculas.findFirst({
      where: { titulo: `Pelicula ${i + 1}` },
    });
    if (!pelicula) {
      pelicula = await prisma.peliculas.create({
        data: {
          titulo: `Pelicula ${i + 1}`,
          sinopsis: `Sinopsis de la pelicula ${i + 1}`,
          poster_url: `https://example.com/poster${i + 1}.jpg`,
          id_idioma: idiomas[i].id,
          id_genero: generos[i].id,
          fecha_estreno: new Date(),
          activo: true,
          id_usuario: adminUser.id,
        },
      });
    }
    peliculas.push(pelicula);
  }

  // 10. Funciones (5 registros) y 11. AsientosFuncion
  const funciones: Funciones[] = [];
  for (let i = 0; i < 5; i++) {
    let funcion = await prisma.funciones.findFirst({
      where: { id_pelicula: peliculas[i].id, id_sala: salas[i].id },
    });
    if (!funcion) {
      funcion = await prisma.funciones.create({
        data: {
          id_pelicula: peliculas[i].id,
          id_sala: salas[i].id,
          fecha_hora: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // + i dias
          estado: 'PROGRAMADA',
        },
      });

      // AsientosFuncion (5 * 25 = 125 en total)
      const asientosSala = await prisma.asientos.findMany({
        where: { id_sala: salas[i].id },
      });
      for (const asiento of asientosSala) {
        await prisma.asientosFuncion.create({
          data: {
            id_asiento: asiento.id,
            id_funcion: funcion.id,
            estado: 'DISPONIBLE',
            version: 1,
          },
        });
      }
    }
    funciones.push(funcion);
  }

  // 12. Cupones
  const cuponesData = [
    { codigo: 'PROMO20', tipo: 'PORCENTAJE', valor: 20.0, usos_maximos: null },
    { codigo: 'DESC50', tipo: 'FIJO', valor: 50.0, usos_maximos: 10 },
    { codigo: 'CUPON3', tipo: 'PORCENTAJE', valor: 15.0, usos_maximos: 100 },
    { codigo: 'CUPON4', tipo: 'PORCENTAJE', valor: 5.0, usos_maximos: 100 },
    { codigo: 'CUPON5', tipo: 'FIJO', valor: 10.0, usos_maximos: 50 },
  ];
  const cupones: Cupones[] = [];
  for (const c of cuponesData) {
    const cupon = await prisma.cupones.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: c.valor,
        fecha_expiracion: new Date('2027-12-31'),
        usos_maximos: c.usos_maximos,
      },
    });
    cupones.push(cupon);
  }

  // 13. Reservas (5), 14. ReservaAsientos (5), 15. Pagos (5), 16. Reembolsos (5)
  for (let i = 0; i < 5; i++) {
    const reservaNumero = `RES-000${i + 1}`;
    let reserva = await prisma.reservas.findFirst({
      where: { numero_reserva: reservaNumero },
    });

    if (!reserva) {
      reserva = await prisma.reservas.create({
        data: {
          numero_reserva: reservaNumero,
          id_usuario: usuarios[i].id,
          id_funcion: funciones[i].id,
          estado: 'CONFIRMADA',
        },
      });

      // 14. Obtener un asiento función disponible para esta función
      const asientoFuncion = await prisma.asientosFuncion.findFirst({
        where: { id_funcion: funciones[i].id, estado: 'DISPONIBLE' },
      });

      if (asientoFuncion) {
        await prisma.reservaAsientos.create({
          data: {
            id_reserva: reserva.id,
            id_asiento_funcion: asientoFuncion.id,
          },
        });

        await prisma.asientosFuncion.update({
          where: { id: asientoFuncion.id },
          data: { estado: 'OCUPADO' },
        });
      }

      // 15. Pagos
      const pago = await prisma.pagos.create({
        data: {
          id_reserva: reserva.id,
          id_cupon: cupones[i].id,
          monto_original: 100.0,
          monto_descuento: 10.0 + i,
          monto_final: 90.0 - i,
          metodo: 'TARJETA_CREDITO',
          estado: 'COMPLETADO',
          referencia_externa: `REF-XYZ12${i}`,
        },
      });

      // 16. Reembolsos
      await prisma.reembolsos.create({
        data: {
          id_pago: pago.id,
          monto: 0.0,
          estado: 'NO_APLICA',
        },
      });
    }
  }

  // 17. PoliticaCancelacion
  const politicasData = [
    { horas_antes_minimo: 24, porcentaje_reembolso: 50.0 },
    { horas_antes_minimo: 48, porcentaje_reembolso: 75.0 },
    { horas_antes_minimo: 72, porcentaje_reembolso: 100.0 },
    { horas_antes_minimo: 12, porcentaje_reembolso: 25.0 },
    { horas_antes_minimo: 6, porcentaje_reembolso: 10.0 },
  ];
  const countPoliticas = await prisma.politicaCancelacion.count();
  if (countPoliticas < politicasData.length) {
    for (let i = countPoliticas; i < politicasData.length; i++) {
      await prisma.politicaCancelacion.create({
        data: politicasData[i],
      });
    }
  }

  // 18. AuditLog (5 registros)
  for (let i = 0; i < 5; i++) {
    await prisma.auditLog.create({
      data: {
        id_usuario: usuarios[i].id,
        id_auditor: adminUser.id,
        accion: 'SEEDER_EJECUTADO',
        detalle: `Seeder para poblar registro ${i + 1}`,
      },
    });
  }

  // 19. PasswordResetToken (5 registros)
  for (let i = 0; i < 5; i++) {
    const tokenStr = `token-reset-100${i + 1}`;
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token: tokenStr },
    });
    if (!resetToken) {
      await prisma.passwordResetToken.create({
        data: {
          id_usuario: usuarios[i].id,
          token: tokenStr,
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
        },
      });
    }
  }

  console.log(
    'Seeder ejecutado con éxito. Se han insertado al menos 5 registros por tabla.',
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

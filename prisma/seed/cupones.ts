import { prisma } from './client';

const CUPONES: ReadonlyArray<{
  codigo: string;
  tipo: string;
  valor: number;
  dias_expira: number;
  usos_maximos: number | null;
  titulo: string;
  descripcion: string;
}> = [
  {
    codigo: 'BIENVENIDA10',
    tipo: 'porcentaje',
    valor: 10,
    dias_expira: 90,
    usos_maximos: 1000,
    titulo: 'Bienvenido a Movies+',
    descripcion: 'Disfruta un 10 % de descuento en tu primera compra. ¡Gracias por elegirnos y bienvenido a la mejor experiencia de cine!',
  },
  {
    codigo: 'VERANO20',
    tipo: 'porcentaje',
    valor: 20,
    dias_expira: 60,
    usos_maximos: 500,
    titulo: 'Promo Verano 20% off',
    descripcion: 'Celebra el verano con un 20 % de descuento en todas las funciones. Válido por tiempo limitado mientras dure la temporada.',
  },
  {
    codigo: 'ESTRENO5',
    tipo: 'monto',
    valor: 5,
    dias_expira: 30,
    usos_maximos: 200,
    titulo: 'Noche de Estreno',
    descripcion: 'Obtén Q5 de descuento al comprar tu boleto para cualquier estreno de la semana. ¡No te pierdas el primer día en pantalla!',
  },
  {
    codigo: 'FAMILIA15',
    tipo: 'porcentaje',
    valor: 15,
    dias_expira: 120,
    usos_maximos: 300,
    titulo: 'Pack Familiar 15% off',
    descripcion: 'Lleva a toda la familia al cine y ahorra un 15 % en tus boletos. El mejor plan para disfrutar juntos una tarde de película.',
  },
  {
    codigo: 'ESTUDIANTE25',
    tipo: 'porcentaje',
    valor: 25,
    dias_expira: 180,
    usos_maximos: null,
    titulo: '25% Descuento Estudiante',
    descripcion: 'Presenta tu carné universitario y obtén 25 % de descuento en cualquier función. Exclusivo para estudiantes activos sin límite de usos.',
  },
  {
    codigo: 'NAVIDAD30',
    tipo: 'porcentaje',
    valor: 30,
    dias_expira: 45,
    usos_maximos: 1000,
    titulo: 'Especial Navidad 30% off',
    descripcion: '¡Celebra la temporada navideña en el cine! Disfruta un 30 % de descuento en tus boletos durante las fiestas de fin de año.',
  },
  {
    codigo: 'CUMPLE50',
    tipo: 'monto',
    valor: 50,
    dias_expira: 30,
    usos_maximos: 100,
    titulo: 'Regalo de Cumpleaños Q50',
    descripcion: 'En tu mes de cumpleaños te regalamos Q50 de descuento para que celebres como mereces. ¡Feliz cumpleaños de parte de Movies+!',
  },
  {
    codigo: 'MARTES2X1',
    tipo: 'porcentaje',
    valor: 50,
    dias_expira: 90,
    usos_maximos: null,
    titulo: 'Tarde de martes 2x1',
    descripcion: 'Los martes son día de cine: paga un boleto y lleva a un acompañante gratis. Válido todos los martes en funciones de tarde.',
  },
  {
    codigo: 'COMBO10',
    tipo: 'monto',
    valor: 10,
    dias_expira: 60,
    usos_maximos: 400,
    titulo: '10% off primera compra',
    descripcion: 'Ahorra Q10 al comprar tu combo de boleto + palomitas. La experiencia completa al mejor precio, solo por esta temporada.',
  },
  {
    codigo: 'PREMIER40',
    tipo: 'porcentaje',
    valor: 40,
    dias_expira: 14,
    usos_maximos: 50,
    titulo: 'Avant-Première Exclusiva',
    descripcion: 'Accede con un 40 % de descuento a las funciones avant-première seleccionadas. Cupos muy limitados; ¡reserva antes de que se agoten!',
  },
];

export interface CuponSeed {
  id: bigint;
  codigo: string;
}

export interface CuponesMap {
  all: CuponSeed[];
}

export async function seedCupones(): Promise<CuponesMap> {
  const all: CuponSeed[] = [];
  const now = Date.now();
  for (const c of CUPONES) {
    const cupon = await prisma.cupones.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: c.valor,
        fecha_expiracion: new Date(now + c.dias_expira * 86400 * 1000),
        usos_maximos: c.usos_maximos,
        titulo: c.titulo,
        descripcion: c.descripcion,
      },
      select: { id: true, codigo: true },
    });
    all.push(cupon);
  }
  return { all };
}

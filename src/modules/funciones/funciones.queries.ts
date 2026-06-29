import { PrismaService } from '../../prisma/prisma.service';

export async function findFuncionWithAsientos(
  prisma: PrismaService,
  idFuncion: bigint,
  opts: { includeUsuario: boolean },
) {
  return prisma.funciones.findUnique({
    where: { id: idFuncion },
    include: {
      salas: { select: { filas: true, columnas: true, id_cine: true } },
      asientosFuncions: {
        include: {
          asientos: {
            include: {
              tipoAsiento: { select: { id: true, nombre: true, color: true } },
            },
          },
          ...(opts.includeUsuario
            ? { usuarios: { select: { id: true, email: true } } }
            : {}),
        },
        orderBy: [
          { asientos: { fila: 'asc' } },
          { asientos: { columna: 'asc' } },
        ],
      },
    },
  });
}

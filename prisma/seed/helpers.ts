export async function upsertByNombre(
  table: { upsert: (args: any) => Promise<{ id: bigint }> },
  nombre: string,
  extra: Record<string, unknown> = {},
): Promise<{ id: bigint }> {
  return table.upsert({
    where: { nombre },
    update: {},
    create: { nombre, ...extra },
    select: { id: true },
  });
}

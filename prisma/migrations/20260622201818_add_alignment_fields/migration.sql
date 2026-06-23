-- AlterTable
ALTER TABLE "cupones" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "titulo" VARCHAR(100);

-- AlterTable
ALTER TABLE "peliculas" ADD COLUMN     "duracion_min" INTEGER,
ADD COLUMN     "ficha_tecnica" JSONB,
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating_promedio" DECIMAL(3,2),
ADD COLUMN     "tagline" VARCHAR(200);

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "expira_en" TIMESTAMPTZ,
ADD COLUMN     "notas_internas" TEXT;

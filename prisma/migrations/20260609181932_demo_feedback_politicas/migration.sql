/*
  Warnings:

  - You are about to drop the column `horas_antes_maximo` on the `politica_cancelacion` table. All the data in the column will be lost.
  - You are about to drop the column `horas_antes_minimo` on the `politica_cancelacion` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje_reembolso` on the `politica_cancelacion` table. All the data in the column will be lost.
  - Added the required column `id_cine` to the `politica_cancelacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `politica_cancelacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "politica_cancelacion" DROP COLUMN "horas_antes_maximo",
DROP COLUMN "horas_antes_minimo",
DROP COLUMN "porcentaje_reembolso",
ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_cine" BIGINT NOT NULL,
ADD COLUMN     "nombre" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "reembolsos" ADD COLUMN     "id_politica" BIGINT,
ADD COLUMN     "porcentaje_aplicado" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "regla_politica_cancelacion" (
    "id" BIGSERIAL NOT NULL,
    "id_politica" BIGINT NOT NULL,
    "horas_antes_minimo" INTEGER NOT NULL,
    "horas_antes_maximo" INTEGER,
    "porcentaje_reembolso" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "regla_politica_cancelacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regla_politica_cancelacion_id_politica_idx" ON "regla_politica_cancelacion"("id_politica");

-- CreateIndex
CREATE INDEX "politica_cancelacion_id_cine_idx" ON "politica_cancelacion"("id_cine");

-- CreateIndex
CREATE INDEX "reembolsos_id_politica_idx" ON "reembolsos"("id_politica");

-- AddForeignKey
ALTER TABLE "politica_cancelacion" ADD CONSTRAINT "politica_cancelacion_id_cine_fkey" FOREIGN KEY ("id_cine") REFERENCES "cines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regla_politica_cancelacion" ADD CONSTRAINT "regla_politica_cancelacion_id_politica_fkey" FOREIGN KEY ("id_politica") REFERENCES "politica_cancelacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_id_politica_fkey" FOREIGN KEY ("id_politica") REFERENCES "politica_cancelacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One active policy per cine (partial unique index)
CREATE UNIQUE INDEX "uniq_politica_activa_por_cine"
  ON "politica_cancelacion" ("id_cine")
  WHERE "activa" = true;

-- Sanity checks on rule ranges and percentages
ALTER TABLE "regla_politica_cancelacion"
  ADD CONSTRAINT "regla_horas_minimo_nonneg" CHECK ("horas_antes_minimo" >= 0),
  ADD CONSTRAINT "regla_horas_maximo_gt_minimo" CHECK ("horas_antes_maximo" IS NULL OR "horas_antes_maximo" > "horas_antes_minimo"),
  ADD CONSTRAINT "regla_porcentaje_range" CHECK ("porcentaje_reembolso" >= 0 AND "porcentaje_reembolso" <= 100);

ALTER TABLE "reembolsos"
  ADD CONSTRAINT "reembolso_porcentaje_range" CHECK ("porcentaje_aplicado" >= 0 AND "porcentaje_aplicado" <= 100);

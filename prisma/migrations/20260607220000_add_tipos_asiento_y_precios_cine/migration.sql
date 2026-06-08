-- CreateTable
CREATE TABLE "tipos_asiento" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "tipos_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_asiento_nombre_key" ON "tipos_asiento"("nombre");

-- Seed tipos_asiento from distinct existing values in asientos.tipo
INSERT INTO "tipos_asiento" ("nombre")
SELECT DISTINCT "tipo" FROM "asientos"
ON CONFLICT ("nombre") DO NOTHING;

-- AlterTable asientos: add nullable FK, backfill, enforce NOT NULL, drop old column
ALTER TABLE "asientos" ADD COLUMN "id_tipo_asiento" BIGINT;

UPDATE "asientos" AS a
SET "id_tipo_asiento" = ta."id"
FROM "tipos_asiento" AS ta
WHERE ta."nombre" = a."tipo";

ALTER TABLE "asientos" ALTER COLUMN "id_tipo_asiento" SET NOT NULL;

ALTER TABLE "asientos" DROP COLUMN "tipo";

-- AddForeignKey asientos -> tipos_asiento
ALTER TABLE "asientos"
    ADD CONSTRAINT "asientos_id_tipo_asiento_fkey"
    FOREIGN KEY ("id_tipo_asiento") REFERENCES "tipos_asiento"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "precios_cine" (
    "id" BIGSERIAL NOT NULL,
    "id_cine" BIGINT NOT NULL,
    "id_tipo_asiento" BIGINT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "precios_cine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "precios_cine_id_cine_id_tipo_asiento_key"
    ON "precios_cine"("id_cine", "id_tipo_asiento");

-- AddForeignKey precios_cine -> cines
ALTER TABLE "precios_cine"
    ADD CONSTRAINT "precios_cine_id_cine_fkey"
    FOREIGN KEY ("id_cine") REFERENCES "cines"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey precios_cine -> tipos_asiento
ALTER TABLE "precios_cine"
    ADD CONSTRAINT "precios_cine_id_tipo_asiento_fkey"
    FOREIGN KEY ("id_tipo_asiento") REFERENCES "tipos_asiento"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill precios_cine for every (cine x tipo) pair so the booking flow keeps working.
-- Defaults: preferencial = 100, general = 50, otros = 50.
INSERT INTO "precios_cine" ("id_cine", "id_tipo_asiento", "precio")
SELECT
    c."id",
    ta."id",
    CASE ta."nombre"
        WHEN 'preferencial' THEN 100.00
        WHEN 'general' THEN 50.00
        ELSE 50.00
    END
FROM "cines" AS c
CROSS JOIN "tipos_asiento" AS ta
ON CONFLICT ("id_cine", "id_tipo_asiento") DO NOTHING;

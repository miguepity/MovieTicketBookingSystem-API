-- DropForeignKey
ALTER TABLE "precios_cine" DROP CONSTRAINT "precios_cine_id_cine_fkey";

-- AlterTable: precios_cine — make id_cine nullable, add timestamps
ALTER TABLE "precios_cine" ALTER COLUMN "id_cine" DROP NOT NULL;
ALTER TABLE "precios_cine" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "precios_cine" ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Recreate unique index (nullable id_cine changes semantics)
DROP INDEX IF EXISTS "precios_cine_id_cine_id_tipo_asiento_key";
CREATE UNIQUE INDEX "precios_cine_id_cine_id_tipo_asiento_key" ON "precios_cine"("id_cine", "id_tipo_asiento");

-- AlterTable: usuarios — add ultimo_acceso and password_temporal
ALTER TABLE "usuarios" ADD COLUMN "ultimo_acceso" TIMESTAMPTZ;
ALTER TABLE "usuarios" ADD COLUMN "password_temporal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: peliculas — add deleted_at for soft delete
ALTER TABLE "peliculas" ADD COLUMN "deleted_at" TIMESTAMPTZ;

-- AddForeignKey (now optional)
ALTER TABLE "precios_cine" ADD CONSTRAINT "precios_cine_id_cine_fkey" FOREIGN KEY ("id_cine") REFERENCES "cines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

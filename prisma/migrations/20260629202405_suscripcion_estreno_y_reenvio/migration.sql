-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "ultimo_reenvio_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "suscripcion_estreno" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "id_pelicula" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificado_at" TIMESTAMPTZ,

    CONSTRAINT "suscripcion_estreno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suscripcion_estreno_id_pelicula_notificado_at_idx" ON "suscripcion_estreno"("id_pelicula", "notificado_at");

-- CreateIndex
CREATE UNIQUE INDEX "suscripcion_estreno_id_usuario_id_pelicula_key" ON "suscripcion_estreno"("id_usuario", "id_pelicula");

-- AddForeignKey
ALTER TABLE "suscripcion_estreno" ADD CONSTRAINT "suscripcion_estreno_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripcion_estreno" ADD CONSTRAINT "suscripcion_estreno_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

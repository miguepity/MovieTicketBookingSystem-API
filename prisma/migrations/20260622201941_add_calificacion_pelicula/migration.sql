-- CreateTable
CREATE TABLE "calificacion_pelicula" (
    "id" BIGSERIAL NOT NULL,
    "id_pelicula" BIGINT NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "calificacion_pelicula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calificacion_pelicula_id_pelicula_idx" ON "calificacion_pelicula"("id_pelicula");

-- CreateIndex
CREATE UNIQUE INDEX "calificacion_pelicula_id_pelicula_id_usuario_key" ON "calificacion_pelicula"("id_pelicula", "id_usuario");

-- AddForeignKey
ALTER TABLE "calificacion_pelicula" ADD CONSTRAINT "calificacion_pelicula_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion_pelicula" ADD CONSTRAINT "calificacion_pelicula_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

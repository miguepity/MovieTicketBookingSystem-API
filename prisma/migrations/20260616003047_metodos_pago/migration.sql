-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "id_metodo_pago" BIGINT,
ADD COLUMN     "marca_snapshot" VARCHAR(20),
ADD COLUMN     "ultimos4_snapshot" CHAR(4);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(20),
    "ultimos4" CHAR(4),
    "expiracion" CHAR(5),
    "titular" VARCHAR(120),
    "pan_cifrado" TEXT,
    "predeterminado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metodos_pago_id_usuario_idx" ON "metodos_pago"("id_usuario");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "metodos_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tarjeta requires all card fields; efectivo forbids them.
ALTER TABLE "metodos_pago" ADD CONSTRAINT "tarjeta_completa" CHECK (
  "tipo" <> 'tarjeta' OR (
    "marca" IS NOT NULL
    AND "ultimos4" IS NOT NULL
    AND "expiracion" IS NOT NULL
    AND "pan_cifrado" IS NOT NULL
  )
);

ALTER TABLE "metodos_pago" ADD CONSTRAINT "efectivo_sin_datos" CHECK (
  "tipo" <> 'efectivo' OR (
    "marca" IS NULL
    AND "ultimos4" IS NULL
    AND "expiracion" IS NULL
    AND "pan_cifrado" IS NULL
  )
);

-- One default per user.
CREATE UNIQUE INDEX "una_default_por_usuario"
  ON "metodos_pago" ("id_usuario")
  WHERE "predeterminado";

-- One efectivo per user.
CREATE UNIQUE INDEX "un_efectivo_por_usuario"
  ON "metodos_pago" ("id_usuario")
  WHERE "tipo" = 'efectivo';

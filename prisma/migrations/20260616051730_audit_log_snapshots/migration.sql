-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "entidad" VARCHAR(40),
ADD COLUMN     "entidad_id" BIGINT,
ADD COLUMN     "valor_anterior" JSONB,
ADD COLUMN     "valor_nuevo" JSONB;

-- CreateIndex
CREATE INDEX "audit_log_entidad_entidad_id_idx" ON "audit_log"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_accion_idx" ON "audit_log"("accion");

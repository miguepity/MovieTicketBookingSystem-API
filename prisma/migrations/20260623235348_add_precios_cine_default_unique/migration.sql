-- Partial unique index to enforce one default row per tipo_asiento (where id_cine IS NULL)
CREATE UNIQUE INDEX "precios_cine_default_unique"
ON "precios_cine"("id_tipo_asiento")
WHERE "id_cine" IS NULL;

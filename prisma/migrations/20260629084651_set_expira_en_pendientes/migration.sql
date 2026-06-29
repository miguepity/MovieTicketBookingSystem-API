UPDATE "reservas"
SET "expira_en" = "created_at" + interval '30 minutes'
WHERE "estado" = 'pendiente_pago'
  AND "expira_en" IS NULL;

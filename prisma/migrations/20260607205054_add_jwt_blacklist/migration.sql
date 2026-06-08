-- CreateTable
CREATE TABLE "jwt_blacklist" (
    "jti" VARCHAR(64) NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jwt_blacklist_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "jwt_blacklist_expires_at_idx" ON "jwt_blacklist"("expires_at");

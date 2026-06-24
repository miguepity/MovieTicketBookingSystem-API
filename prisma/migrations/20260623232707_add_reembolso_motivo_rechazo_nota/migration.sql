-- AlterTable
ALTER TABLE "precios_cine" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reembolsos" ADD COLUMN     "motivo_rechazo" TEXT,
ADD COLUMN     "nota" TEXT;

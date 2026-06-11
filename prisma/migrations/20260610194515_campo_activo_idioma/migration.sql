-- AlterTable
ALTER TABLE "idiomas" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

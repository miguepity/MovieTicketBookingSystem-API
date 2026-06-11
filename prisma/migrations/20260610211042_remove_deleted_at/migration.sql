/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `generos` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `idiomas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "generos" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "idiomas" DROP COLUMN "deletedAt";

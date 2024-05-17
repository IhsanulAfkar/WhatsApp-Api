/*
  Warnings:

  - Changed the type of `game` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "game",
ADD COLUMN     "game" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ProductGame";

/*
  Warnings:

  - Added the required column `game` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductGame" AS ENUM ('GENSHIN', 'HSR', 'ML');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "game" "ProductGame" NOT NULL;

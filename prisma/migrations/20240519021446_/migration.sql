/*
  Warnings:

  - The values [DELIVERED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `storeName` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('CREATED', 'PROCESSING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storeName";

-- CreateTable
CREATE TABLE "AutoReply" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "storeName" VARCHAR(50),
    "paymenReply" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AutoReply_pkey" PRIMARY KEY ("pkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoReply_id_key" ON "AutoReply"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutoReply_userId_key" ON "AutoReply"("userId");

-- AddForeignKey
ALTER TABLE "AutoReply" ADD CONSTRAINT "AutoReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

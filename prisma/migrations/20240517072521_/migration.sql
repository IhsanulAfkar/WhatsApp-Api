/*
  Warnings:

  - The values [SHIPPED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `orderData` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderData` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('CREATED', 'PROCESSING', 'DELIVERED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderData",
DROP COLUMN "phone",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ALTER COLUMN "contactId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_pkey",
DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "total",
ADD COLUMN     "contactId" INTEGER,
ADD COLUMN     "orderData" JSONB NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "pkId" SERIAL NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("pkId");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE SET NULL ON UPDATE CASCADE;

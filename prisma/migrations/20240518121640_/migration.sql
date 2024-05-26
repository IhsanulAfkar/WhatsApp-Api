/*
  Warnings:

  - You are about to drop the `AutoReply` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AutoReply" DROP CONSTRAINT "AutoReply_deviceId_fkey";

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "isAutoReply" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storeName" VARCHAR(50);

-- DropTable
DROP TABLE "AutoReply";

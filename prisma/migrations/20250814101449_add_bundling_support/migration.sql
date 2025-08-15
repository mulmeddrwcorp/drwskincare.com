/*
  Warnings:

  - A unique constraint covering the columns `[apiBundlingId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "apiBundlingId" TEXT,
ADD COLUMN     "isBundling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "products_apiBundlingId_key" ON "public"."products"("apiBundlingId");

/*
  Warnings:

  - You are about to drop the column `apiId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `hargaDefault` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `apiId` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `daerah` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `wa` on the `resellers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idProduk]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idReseller]` on the table `resellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idProduk` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaProduk` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `resellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idReseller` to the `resellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `resellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaReseller` to the `resellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorHp` to the `resellers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."products_apiId_key";

-- DropIndex
DROP INDEX "public"."resellers_apiId_key";

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "apiId",
DROP COLUMN "hargaDefault",
DROP COLUMN "kategori",
DROP COLUMN "nama",
ADD COLUMN     "bpom" TEXT,
ADD COLUMN     "fotoProduk" TEXT,
ADD COLUMN     "hargaConsultant" DECIMAL(65,30),
ADD COLUMN     "hargaDirector" DECIMAL(65,30),
ADD COLUMN     "hargaManager" DECIMAL(65,30),
ADD COLUMN     "hargaSupervisor" DECIMAL(65,30),
ADD COLUMN     "hargaUmum" DECIMAL(65,30),
ADD COLUMN     "idProduk" TEXT NOT NULL,
ADD COLUMN     "namaProduk" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."resellers" DROP COLUMN "apiId",
DROP COLUMN "daerah",
DROP COLUMN "nama",
DROP COLUMN "wa",
ADD COLUMN     "area" TEXT NOT NULL,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "fotoReseller" TEXT,
ADD COLUMN     "idReseller" TEXT NOT NULL,
ADD COLUMN     "idUpline" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "namaReseller" TEXT NOT NULL,
ADD COLUMN     "nomorHp" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_idProduk_key" ON "public"."products"("idProduk");

-- CreateIndex
CREATE UNIQUE INDEX "resellers_idReseller_key" ON "public"."resellers"("idReseller");

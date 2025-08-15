/*
  Warnings:

  - You are about to drop the column `customSlug` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNumber` on the `reseller_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `apiData` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `idUpline` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `namaReseller` on the `resellers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nomorHp]` on the table `resellers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_user_id]` on the table `resellers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."reseller_profiles" DROP COLUMN "customSlug",
DROP COLUMN "displayName",
DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "isPublic",
DROP COLUMN "photoUrl",
DROP COLUMN "whatsappNumber",
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "email_address" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "whatsapp_number" TEXT;

-- AlterTable
ALTER TABLE "public"."resellers" DROP COLUMN "apiData",
DROP COLUMN "area",
DROP COLUMN "email",
DROP COLUMN "idUpline",
DROP COLUMN "level",
DROP COLUMN "namaReseller",
ADD COLUMN     "clerk_user_id" TEXT,
ALTER COLUMN "nomorHp" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "resellers_nomorHp_key" ON "public"."resellers"("nomorHp");

-- CreateIndex
CREATE UNIQUE INDEX "resellers_clerk_user_id_key" ON "public"."resellers"("clerk_user_id");

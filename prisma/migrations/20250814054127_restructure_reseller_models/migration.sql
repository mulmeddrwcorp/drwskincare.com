/*
  Warnings:

  - You are about to drop the column `facebook` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `fotoProfil` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `fotoReseller` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `idReseller` on the `resellers` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `resellers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiResellerId]` on the table `resellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiResellerId` to the `resellers` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with default values first
ALTER TABLE "public"."resellers" 
ADD COLUMN     "apiResellerId" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- Step 2: Copy data from old column to new column
UPDATE "public"."resellers" SET "apiResellerId" = "idReseller";

-- Step 3: Make apiResellerId NOT NULL now that it has data
ALTER TABLE "public"."resellers" ALTER COLUMN "apiResellerId" SET NOT NULL;

-- Step 4: Create the ResellerProfile table
CREATE TABLE "public"."reseller_profiles" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "whatsappNumber" TEXT,
    "photoUrl" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "customSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resellerId" TEXT NOT NULL,

    CONSTRAINT "reseller_profiles_pkey" PRIMARY KEY ("id")
);

-- Step 5: Migrate existing profile data to the new table
INSERT INTO "public"."reseller_profiles" (
    "id", 
    "displayName", 
    "whatsappNumber", 
    "photoUrl", 
    "facebook", 
    "instagram", 
    "resellerId", 
    "createdAt", 
    "updatedAt"
)
SELECT 
    gen_random_uuid()::text,
    "namaReseller",
    "nomorHp",
    "fotoProfil",
    "facebook",
    "instagram",
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "public"."resellers";

-- Step 6: Add additional columns to click_logs
ALTER TABLE "public"."click_logs" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- Step 7: Drop old columns and constraints
DROP INDEX "public"."resellers_idReseller_key";

ALTER TABLE "public"."resellers" 
DROP COLUMN "facebook",
DROP COLUMN "fotoProfil",
DROP COLUMN "fotoReseller",
DROP COLUMN "idReseller",
DROP COLUMN "instagram";

-- Step 8: Create new indexes and constraints
CREATE UNIQUE INDEX "reseller_profiles_resellerId_key" ON "public"."reseller_profiles"("resellerId");
CREATE UNIQUE INDEX "resellers_apiResellerId_key" ON "public"."resellers"("apiResellerId");

-- Step 9: Add foreign key constraint
ALTER TABLE "public"."reseller_profiles" ADD CONSTRAINT "reseller_profiles_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "public"."resellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

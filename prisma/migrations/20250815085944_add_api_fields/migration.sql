-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "items" JSONB;

-- AlterTable
ALTER TABLE "public"."reseller_profiles" ADD COLUMN     "alamat" TEXT,
ADD COLUMN     "apiData" JSONB,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "bank" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "kabupaten" TEXT,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "nama_belakang" TEXT,
ADD COLUMN     "nama_depan" TEXT,
ADD COLUMN     "nama_reseller" TEXT,
ADD COLUMN     "nomor_hp" TEXT,
ADD COLUMN     "provinsi" TEXT,
ADD COLUMN     "rekening" TEXT;

-- AlterTable
ALTER TABLE "public"."resellers" ADD COLUMN     "apiData" JSONB;

-- CreateTable
CREATE TABLE "public"."resellers" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "wa" TEXT NOT NULL,
    "daerah" TEXT NOT NULL,
    "fotoProfil" TEXT,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "hargaDefault" DECIMAL(65,30),
    "gambar" TEXT,
    "kategori" TEXT,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."harga_custom" (
    "id" TEXT NOT NULL,
    "resellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "hargaCustom" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harga_custom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resellers_apiId_key" ON "public"."resellers"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "products_apiId_key" ON "public"."products"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "harga_custom_resellerId_productId_key" ON "public"."harga_custom"("resellerId", "productId");

-- AddForeignKey
ALTER TABLE "public"."harga_custom" ADD CONSTRAINT "harga_custom_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "public"."resellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."harga_custom" ADD CONSTRAINT "harga_custom_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

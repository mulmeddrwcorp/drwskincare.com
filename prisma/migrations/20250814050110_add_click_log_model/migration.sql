-- CreateTable
CREATE TABLE "public"."click_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resellerId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "click_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."click_logs" ADD CONSTRAINT "click_logs_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "public"."resellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AbResult" (
    "id" SERIAL NOT NULL,
    "testName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbResult_testName_variant_idx" ON "AbResult"("testName", "variant");

-- CreateIndex
CREATE INDEX "AbResult_visitorId_idx" ON "AbResult"("visitorId");

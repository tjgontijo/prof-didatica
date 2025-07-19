-- CreateTable
CREATE TABLE "AbResult" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "fbclid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbResult_testName_variant_idx" ON "AbResult"("testName", "variant");

-- CreateIndex
CREATE INDEX "AbResult_visitorId_idx" ON "AbResult"("visitorId");

-- CreateIndex
CREATE INDEX "AbResult_sessionId_idx" ON "AbResult"("sessionId");

-- CreateIndex
CREATE INDEX "AbResult_utmSource_utmMedium_utmCampaign_idx" ON "AbResult"("utmSource", "utmMedium", "utmCampaign");

-- CreateIndex
CREATE INDEX "AbResult_fbclid_idx" ON "AbResult"("fbclid");

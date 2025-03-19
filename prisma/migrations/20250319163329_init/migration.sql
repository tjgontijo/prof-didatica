-- CreateTable
CREATE TABLE "AbTest" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "testId" TEXT NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbEvent" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "leadId" TEXT,
    "leadEmail" TEXT,
    "leadName" TEXT,
    "leadPhone" TEXT,

    CONSTRAINT "AbEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbTest_testId_key" ON "AbTest"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_testId_variantId_key" ON "Variant"("testId", "variantId");

-- CreateIndex
CREATE INDEX "AbEvent_testId_eventType_idx" ON "AbEvent"("testId", "eventType");

-- CreateIndex
CREATE INDEX "AbEvent_sessionId_idx" ON "AbEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AbEvent_createdAt_idx" ON "AbEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AbEvent_leadEmail_idx" ON "AbEvent"("leadEmail");

-- CreateIndex
CREATE INDEX "AbEvent_leadId_idx" ON "AbEvent"("leadId");

-- CreateIndex
CREATE INDEX "AbEvent_utmSource_utmMedium_utmCampaign_idx" ON "AbEvent"("utmSource", "utmMedium", "utmCampaign");

-- CreateIndex
CREATE INDEX "AbEvent_country_state_city_idx" ON "AbEvent"("country", "state", "city");

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AbTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbEvent" ADD CONSTRAINT "AbEvent_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AbTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbEvent" ADD CONSTRAINT "AbEvent_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

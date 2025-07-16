-- CreateTable
CREATE TABLE "AbResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AbResult_testName_variant_idx" ON "AbResult"("testName", "variant");

-- CreateIndex
CREATE INDEX "AbResult_visitorId_idx" ON "AbResult"("visitorId");

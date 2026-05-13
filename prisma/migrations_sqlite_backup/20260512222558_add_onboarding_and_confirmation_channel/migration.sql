-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "confirmationChannel" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "voice" TEXT NOT NULL DEFAULT 'friendly',
    "customPrompt" TEXT,
    "escalationPhone" TEXT,
    "escalationEmail" TEXT,
    "model" TEXT NOT NULL DEFAULT 'mock-llm-v1',
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIConfig" ("businessId", "customPrompt", "escalationEmail", "escalationPhone", "id", "model", "temperature", "updatedAt", "voice") SELECT "businessId", "customPrompt", "escalationEmail", "escalationPhone", "id", "model", "temperature", "updatedAt", "voice" FROM "AIConfig";
DROP TABLE "AIConfig";
ALTER TABLE "new_AIConfig" RENAME TO "AIConfig";
CREATE UNIQUE INDEX "AIConfig_businessId_key" ON "AIConfig"("businessId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

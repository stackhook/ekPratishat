-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

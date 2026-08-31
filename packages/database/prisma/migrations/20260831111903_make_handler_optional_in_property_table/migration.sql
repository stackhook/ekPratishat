-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_handlerId_fkey";

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "handlerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

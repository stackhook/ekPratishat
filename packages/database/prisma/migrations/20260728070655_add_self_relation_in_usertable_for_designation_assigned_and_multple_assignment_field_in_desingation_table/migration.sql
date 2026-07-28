-- AlterTable
ALTER TABLE "Designation" ADD COLUMN     "multipleAssignment" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "designationAssignedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_designationAssignedById_fkey" FOREIGN KEY ("designationAssignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

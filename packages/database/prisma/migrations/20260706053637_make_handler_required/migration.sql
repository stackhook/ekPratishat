-- Step 1: Add the column as NULLABLE first (Removed the NOT NULL constraint for now)
ALTER TABLE "Property" 
ADD COLUMN "handlerId" TEXT,
ADD COLUMN "landAreaMeta" JSONB;

-- 🌟 Step 2: DATA BACKFILL - Safely copy userId into handlerId for all existing rows
UPDATE "Property" 
SET "handlerId" = "userId" 
WHERE "handlerId" IS NULL;

-- Step 3: Now that all legacy rows are populated, safely enforce the strict constraint
ALTER TABLE "Property" 
ALTER COLUMN "handlerId" SET NOT NULL;

-- Step 4: Link the foreign key relation constraints back together
ALTER TABLE "Property" 
ADD CONSTRAINT "Property_handlerId_fkey" 
FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
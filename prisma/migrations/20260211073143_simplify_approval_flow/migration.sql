/*
  Warnings:

  - The values [PENDING_HAR,PENDING_OP,PROGRESS,PENDING_RELEASE] on the enum `LotoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LotoStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSE', 'CANCELLED');
ALTER TABLE "loto_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "loto_requests" ALTER COLUMN "status" TYPE "LotoStatus_new" USING ("status"::text::"LotoStatus_new");
ALTER TABLE "loto_history" ALTER COLUMN "old_status" TYPE "LotoStatus_new" USING ("old_status"::text::"LotoStatus_new");
ALTER TABLE "loto_history" ALTER COLUMN "new_status" TYPE "LotoStatus_new" USING ("new_status"::text::"LotoStatus_new");
ALTER TYPE "LotoStatus" RENAME TO "LotoStatus_old";
ALTER TYPE "LotoStatus_new" RENAME TO "LotoStatus";
DROP TYPE "LotoStatus_old";
ALTER TABLE "loto_requests" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

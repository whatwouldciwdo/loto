/*
  Warnings:

  - The values [SP_HAR,SPS_HAR,OP_LOKAL,OP_CCR,PELAKSANA_HAR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'PEMELIHARAAN', 'OPERATOR');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "loto_approvals" ALTER COLUMN "approver_role" TYPE "UserRole_new" USING ("approver_role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

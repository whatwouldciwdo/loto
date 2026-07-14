-- Add phone_number column to users (was previously applied via `prisma db push`
-- without a migration file; this migration makes it reproducible on deploy).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_number" TEXT;

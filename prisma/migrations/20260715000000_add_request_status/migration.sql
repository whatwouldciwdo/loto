-- Add REQUEST value to LotoStatus enum
-- The application (schema.prisma + loto.service.ts) creates new LOTO
-- requests with status REQUEST, but the database enum never had it.

ALTER TYPE "LotoStatus" ADD VALUE IF NOT EXISTS 'REQUEST';

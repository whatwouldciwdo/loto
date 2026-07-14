-- ============================================
-- Clean Up Test LOTO Requests
-- ============================================

-- This script removes test LOTO requests created during WhatsApp notification testing
-- Run this before deploying to production

BEGIN;

-- Show current count
SELECT 
    'Before cleanup' as status,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'PENDING_HAR' THEN 1 END) as pending_har,
    COUNT(CASE WHEN status = 'PENDING_OP' THEN 1 END) as pending_op,
    COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
    COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as released
FROM "LotoRequest";

-- Delete test requests
-- Option 1: Delete by description pattern (WhatsApp test)
DELETE FROM "LotoRequest"
WHERE 
    description ILIKE '%TEST%WHATSAPP%'
    OR description ILIKE '%NOTIFIKASI%WHATSAPP%'
    OR description ILIKE '%TEST-LOTO-BOT%'
    OR workorderNumber ILIKE '%TEST%';

-- Option 2: Delete by date (if you want to remove all requests from today)
-- DELETE FROM "LotoRequest"
-- WHERE DATE("createdAt") = CURRENT_DATE;

-- Option 3: Delete by request number pattern
-- DELETE FROM "LotoRequest"
-- WHERE "requestNumber" IN ('LOTO-2026-0008', 'LOTO-2026-0011', 'LOTO-2026-0012', 'LOTO-2026-0013');

-- Show count after cleanup
SELECT 
    'After cleanup' as status,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'PENDING_HAR' THEN 1 END) as pending_har,
    COUNT(CASE WHEN status = 'PENDING_OP' THEN 1 END) as pending_op,
    COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
    COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as released
FROM "LotoRequest";

-- IMPORTANT: Review the changes before committing!
-- If everything looks good, run: COMMIT;
-- If you want to undo, run: ROLLBACK;

-- COMMIT;
ROLLBACK; -- Change to COMMIT after reviewing

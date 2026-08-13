-- Verify Table Count
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Verify key tables exist (this will fail if they don't, which is good for verification)
SELECT count(*) FROM roles;
SELECT count(*) FROM ai_providers;

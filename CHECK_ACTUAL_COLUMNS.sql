-- Check what columns actually exist in messages table
-- Run this in your Supabase SQL Editor

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

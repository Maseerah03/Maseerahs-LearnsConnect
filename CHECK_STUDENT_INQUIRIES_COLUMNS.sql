-- Check what columns actually exist in student_inquiries table
-- Run this in your Supabase SQL Editor

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_inquiries'
ORDER BY ordinal_position;

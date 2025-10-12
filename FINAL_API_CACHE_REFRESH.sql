-- FINAL API CACHE REFRESH
-- Run this in your Supabase SQL Editor

-- 1. Force multiple schema cache refreshes
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 2. Wait a moment and test the exact insert your code is doing
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c', -- Use the exact institution ID from your test
    'API CACHE REFRESH TEST',
    'test@apicache.com',
    'Test Course',
    'Testing after API cache refresh',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 3. Clean up
DELETE FROM student_inquiries WHERE student_name = 'API CACHE REFRESH TEST';

-- 4. Final schema refresh
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

SELECT 'API CACHE REFRESHED - TEST YOUR CONTACT FORM NOW!' as status;

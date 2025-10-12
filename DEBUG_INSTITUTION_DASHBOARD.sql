-- DEBUG INSTITUTION DASHBOARD ISSUE
-- Run this in your Supabase SQL Editor

-- 1. Check all inquiries in the table
SELECT 'ALL INQUIRIES' as check_type;
SELECT 
    id,
    institution_id,
    student_name,
    student_email,
    course_interest,
    status,
    created_at
FROM student_inquiries 
ORDER BY created_at DESC;

-- 2. Check all institution profiles
SELECT 'ALL INSTITUTION PROFILES' as check_type;
SELECT 
    user_id,
    institution_name,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 3. Check if there's a mismatch between inquiry institution_id and institution user_id
SELECT 'INQUIRY-INSTITUTION MATCH CHECK' as check_type;
SELECT 
    si.institution_id as inquiry_institution_id,
    ip.user_id as institution_user_id,
    ip.institution_name,
    si.student_name,
    si.course_interest,
    CASE 
        WHEN si.institution_id = ip.user_id THEN 'MATCH' 
        ELSE 'NO MATCH' 
    END as match_status
FROM student_inquiries si
LEFT JOIN institution_profiles ip ON si.institution_id = ip.user_id;

-- 4. Check what user_id the institution dashboard is looking for
SELECT 'CURRENT USER CHECK' as check_type;
SELECT 
    current_user,
    current_database(),
    current_schema();

SELECT 'DEBUG COMPLETE - CHECK RESULTS ABOVE' as status;

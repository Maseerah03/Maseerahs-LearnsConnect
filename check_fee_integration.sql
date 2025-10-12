-- Check Fee Integration Status
-- This script checks why fees aren't being created automatically

-- 1. Check if we have enrollments and their course fees
SELECT '=== CHECKING ENROLLMENTS AND COURSE FEES ===' as status;

SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.enrolled_at,
    ce.status as enrollment_status,
    ic.title as course_title,
    ic.fee_structure,
    (ic.fee_structure->>'amount')::DECIMAL(10,2) as course_fee_amount,
    ic.fee_structure->>'currency' as course_currency
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
ORDER BY ce.enrolled_at DESC
LIMIT 10;

-- 2. Check if fees exist for these enrollments
SELECT '=== CHECKING EXISTING FEES ===' as status;

SELECT 
    sf.id as fee_id,
    sf.enrollment_id,
    sf.student_id,
    sf.course_id,
    sf.total_amount,
    sf.amount_paid,
    sf.balance_due,
    sf.payment_status,
    sf.created_at as fee_created_at
FROM student_fees sf
ORDER BY sf.created_at DESC;

-- 3. Check which enrollments are missing fees
SELECT '=== ENROLLMENTS MISSING FEES ===' as status;

SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ic.title as course_title,
    (ic.fee_structure->>'amount')::DECIMAL(10,2) as course_fee_amount,
    ic.fee_structure->>'currency' as course_currency,
    ce.enrolled_at
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE NOT EXISTS (
    SELECT 1 FROM student_fees sf 
    WHERE sf.enrollment_id = ce.id
)
AND (ic.fee_structure->>'amount')::DECIMAL(10,2) > 0
ORDER BY ce.enrolled_at DESC;

-- 4. Check if the trigger function exists
SELECT '=== CHECKING TRIGGER FUNCTION ===' as status;

SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_fee_for_enrollment'
AND routine_schema = 'public';

-- 5. Check if the trigger exists
SELECT '=== CHECKING TRIGGER ===' as status;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_fee_for_enrollment_trigger'
AND event_object_table = 'course_enrollments';

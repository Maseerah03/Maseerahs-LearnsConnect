-- Create Fee for Existing Enrollment
-- This creates a fee for the existing enrollment we found

-- 1. Create fee for the existing enrollment
INSERT INTO student_fees (
    enrollment_id,
    student_id,
    course_id,
    institution_id,
    total_amount,
    amount_paid,
    currency,
    payment_status,
    due_date,
    fee_type,
    notes
)
SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ic.institution_id,
    (ic.fee_structure->>'amount')::DECIMAL(10,2) as total_amount,
    0.00 as amount_paid,
    COALESCE(ic.fee_structure->>'currency', 'INR') as currency,
    'pending' as payment_status,
    ce.enrolled_at::DATE + INTERVAL '30 days' as due_date,
    'tuition' as fee_type,
    'Fee for ' || ic.title as notes
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05'
AND NOT EXISTS (
    SELECT 1 FROM student_fees sf 
    WHERE sf.enrollment_id = ce.id
);

-- 2. Verify the fee was created
SELECT '=== FEE CREATED ===' as status;

SELECT 
    sf.id,
    sf.enrollment_id,
    sf.total_amount,
    sf.amount_paid,
    sf.balance_due,
    sf.currency,
    sf.payment_status,
    sf.due_date,
    sf.fee_type,
    sf.notes
FROM student_fees sf
WHERE sf.enrollment_id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 3. Test the trigger by creating a new enrollment (if you want to test)
-- Uncomment the lines below to test the trigger with a new enrollment

/*
-- Create a test enrollment to verify the trigger works
INSERT INTO course_enrollments (course_id, student_id, status, enrolled_at)
VALUES (
    'c88956fc-d21d-4bd5-9351-00026ed7f7ac',  -- Same course
    '4136968b-f971-4b9c-82ed-bbc0c4d82171',  -- Same student (this will fail due to unique constraint, but that's expected)
    'enrolled',
    NOW()
);

-- Check if a fee was automatically created for the new enrollment
SELECT '=== CHECKING FOR AUTO-CREATED FEE ===' as status;

SELECT 
    sf.id,
    sf.enrollment_id,
    sf.total_amount,
    sf.amount_paid,
    sf.balance_due,
    sf.currency,
    sf.payment_status,
    sf.created_at
FROM student_fees sf
WHERE sf.created_at >= NOW() - INTERVAL '1 minute'
ORDER BY sf.created_at DESC;
*/

-- 4. Show all fees now
SELECT '=== ALL FEES ===' as status;

SELECT 
    sf.id,
    sf.enrollment_id,
    sf.total_amount,
    sf.amount_paid,
    sf.balance_due,
    sf.currency,
    sf.payment_status,
    sf.due_date,
    p.full_name as student_name,
    ic.title as course_title
FROM student_fees sf
JOIN profiles p ON sf.student_id = p.id
JOIN institution_courses ic ON sf.course_id = ic.id
ORDER BY sf.created_at DESC;

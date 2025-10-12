-- Create Fees for Existing Enrollments
-- This script creates fees for all existing enrollments based on their course rates

-- 1. First, let's see what we're working with
SELECT '=== CURRENT ENROLLMENTS AND COURSE RATES ===' as status;

SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.enrolled_at,
    ic.title as course_title,
    (ic.fee_structure->>'amount')::DECIMAL(10,2) as course_fee_amount,
    ic.fee_structure->>'currency' as course_currency,
    ic.institution_id
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE (ic.fee_structure->>'amount')::DECIMAL(10,2) > 0
ORDER BY ce.enrolled_at DESC;

-- 2. Create fees for all existing enrollments that don't have fees yet
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
WHERE NOT EXISTS (
    SELECT 1 FROM student_fees sf 
    WHERE sf.enrollment_id = ce.id
)
AND (ic.fee_structure->>'amount')::DECIMAL(10,2) > 0
AND ce.status = 'enrolled';

-- 3. Show how many fees were created
SELECT '=== FEES CREATED ===' as status;

SELECT 
    COUNT(*) as total_fees_created,
    SUM(total_amount) as total_amount,
    currency
FROM student_fees
WHERE created_at >= NOW() - INTERVAL '1 minute'
GROUP BY currency;

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

-- 5. Create some sample payment variations
UPDATE student_fees 
SET 
    amount_paid = CASE 
        WHEN id % 4 = 0 THEN total_amount  -- Fully paid
        WHEN id % 4 = 1 THEN total_amount * 0.5  -- Half paid
        WHEN id % 4 = 2 THEN total_amount * 0.25  -- Quarter paid
        ELSE 0  -- Not paid
    END,
    payment_status = CASE 
        WHEN id % 4 = 0 THEN 'paid'
        WHEN id % 4 = 1 THEN 'partial'
        WHEN id % 4 = 2 THEN 'partial'
        ELSE 'pending'
    END
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- 6. Final summary
SELECT '=== FINAL FEE SUMMARY ===' as status;

SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount,
    SUM(amount_paid) as total_paid,
    SUM(balance_due) as total_balance
FROM student_fees
GROUP BY payment_status
ORDER BY payment_status;

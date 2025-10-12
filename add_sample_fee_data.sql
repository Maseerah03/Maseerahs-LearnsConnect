-- Add Sample Fee Data
-- This script adds sample fee data to test the fee management system

-- First, let's check what data we have to work with
SELECT '=== CHECKING EXISTING DATA ===' as status;

-- Check if we have any enrollments
SELECT 
    'course_enrollments' as table_name,
    COUNT(*) as record_count
FROM course_enrollments
UNION ALL
SELECT 
    'institution_courses' as table_name,
    COUNT(*) as record_count
FROM institution_courses
UNION ALL
SELECT 
    'profiles (students)' as table_name,
    COUNT(*) as record_count
FROM profiles 
WHERE role = 'student';

-- Check if we have any existing fees
SELECT 
    'student_fees' as table_name,
    COUNT(*) as record_count
FROM student_fees;

-- Add sample fee data if we have the required tables and data
DO $$ 
DECLARE
    sample_student_id UUID;
    sample_course_id UUID;
    sample_institution_id UUID;
    sample_enrollment_id UUID;
    fee_count INTEGER := 0;
BEGIN
    -- Get a sample student
    SELECT id INTO sample_student_id 
    FROM profiles 
    WHERE role = 'student' 
    LIMIT 1;
    
    -- Get a sample course
    SELECT id, institution_id INTO sample_course_id, sample_institution_id
    FROM institution_courses 
    LIMIT 1;
    
    -- If we have both student and course, create sample data
    IF sample_student_id IS NOT NULL AND sample_course_id IS NOT NULL THEN
        
        -- Create a sample enrollment if course_enrollments table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
            INSERT INTO course_enrollments (course_id, student_id, status, enrolled_at)
            VALUES (sample_course_id, sample_student_id, 'enrolled', NOW())
            ON CONFLICT (course_id, student_id) DO NOTHING
            RETURNING id INTO sample_enrollment_id;
            
            -- If no enrollment was created (conflict), get existing one
            IF sample_enrollment_id IS NULL THEN
                SELECT id INTO sample_enrollment_id 
                FROM course_enrollments 
                WHERE course_id = sample_course_id AND student_id = sample_student_id
                LIMIT 1;
            END IF;
        END IF;
        
        -- Create sample fees
        INSERT INTO student_fees (
            enrollment_id,
            student_id,
            course_id,
            institution_id,
            total_amount,
            amount_paid,
            balance_due,
            currency,
            payment_status,
            due_date,
            fee_type,
            notes
        ) VALUES 
        (
            sample_enrollment_id,
            sample_student_id,
            sample_course_id,
            sample_institution_id,
            5000.00,
            0.00,
            5000.00,
            'INR',
            'pending',
            CURRENT_DATE + INTERVAL '15 days',
            'tuition',
            'Sample tuition fee for testing'
        ),
        (
            sample_enrollment_id,
            sample_student_id,
            sample_course_id,
            sample_institution_id,
            3000.00,
            1500.00,
            1500.00,
            'INR',
            'partial',
            CURRENT_DATE + INTERVAL '10 days',
            'tuition',
            'Sample partial payment fee'
        ),
        (
            sample_enrollment_id,
            sample_student_id,
            sample_course_id,
            sample_institution_id,
            2000.00,
            2000.00,
            0.00,
            'INR',
            'paid',
            CURRENT_DATE - INTERVAL '5 days',
            'tuition',
            'Sample paid fee'
        ),
        (
            sample_enrollment_id,
            sample_student_id,
            sample_course_id,
            sample_institution_id,
            1000.00,
            0.00,
            1000.00,
            'INR',
            'overdue',
            CURRENT_DATE - INTERVAL '10 days',
            'tuition',
            'Sample overdue fee'
        )
        ON CONFLICT (enrollment_id) DO NOTHING;
        
        GET DIAGNOSTICS fee_count = ROW_COUNT;
        
        RAISE NOTICE 'Created % sample fees', fee_count;
        
    ELSE
        RAISE NOTICE 'No sample student or course found. Please ensure you have students and courses in your database.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample fees: %', SQLERRM;
END $$;

-- Verify the sample data was created
SELECT '=== SAMPLE FEES CREATED ===' as status;
SELECT 
    id,
    total_amount,
    amount_paid,
    balance_due,
    currency,
    payment_status,
    due_date,
    fee_type
FROM student_fees
ORDER BY created_at DESC;

-- Show summary
SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount,
    SUM(amount_paid) as total_paid,
    SUM(balance_due) as total_balance
FROM student_fees
GROUP BY payment_status
ORDER BY payment_status;

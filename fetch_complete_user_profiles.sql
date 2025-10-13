-- Complete user profiles fetch script
-- This script fetches all user data with role-specific information

-- 1. Fetch all users with their complete profile data
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at,
    
    -- Tutor-specific fields
    tp.experience as tutor_experience,
    tp.qualifications as tutor_qualifications,
    tp.subjects as tutor_subjects,
    tp.teaching_mode as tutor_teaching_mode,
    tp.hourly_rate as tutor_hourly_rate,
    tp.availability as tutor_availability,
    tp.languages as tutor_languages,
    tp.achievements as tutor_achievements,
    tp.rating as tutor_rating,
    tp.reviews_count as tutor_reviews_count,
    
    -- Institution-specific fields
    ip.experience as institution_experience,
    ip.qualifications as institution_qualifications,
    ip.subjects as institution_subjects,
    ip.languages as institution_languages,
    ip.rating as institution_rating,
    ip.reviews_count as institution_reviews_count,
    
    -- Student-specific fields
    sp.grade_level as student_grade_level,
    sp.learning_goals as student_learning_goals,
    sp.subjects as student_subjects

FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id AND p.role = 'tutor'
LEFT JOIN institution_profiles ip ON p.user_id = ip.user_id AND p.role = 'institution'
LEFT JOIN student_profiles sp ON p.user_id = sp.user_id AND p.role = 'student'
ORDER BY p.created_at DESC;

-- 2. Fetch only tutors with their complete data
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at,
    tp.experience,
    tp.qualifications,
    tp.subjects,
    tp.teaching_mode,
    tp.hourly_rate,
    tp.availability,
    tp.languages,
    tp.achievements,
    tp.rating,
    tp.reviews_count
FROM profiles p
INNER JOIN tutor_profiles tp ON p.user_id = tp.user_id
WHERE p.role = 'tutor'
ORDER BY p.created_at DESC;

-- 3. Fetch only institutions with their complete data
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at,
    ip.experience,
    ip.qualifications,
    ip.subjects,
    ip.languages,
    ip.rating,
    ip.reviews_count
FROM profiles p
INNER JOIN institution_profiles ip ON p.user_id = ip.user_id
WHERE p.role = 'institution'
ORDER BY p.created_at DESC;

-- 4. Fetch only students with their complete data
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at,
    sp.grade_level,
    sp.learning_goals,
    sp.subjects
FROM profiles p
INNER JOIN student_profiles sp ON p.user_id = sp.user_id
WHERE p.role = 'student'
ORDER BY p.created_at DESC;

-- 5. Count users by role with profile completion status
SELECT 
    p.role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN p.verification_status = 'pending' THEN 1 END) as pending_verification,
    COUNT(CASE WHEN p.verification_status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN p.verification_status = 'rejected' THEN 1 END) as rejected,
    AVG(p.profile_completion) as avg_profile_completion
FROM profiles p
GROUP BY p.role
ORDER BY p.role;

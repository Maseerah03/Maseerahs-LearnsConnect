-- Debug enrollment count issue between Courses and Batches tabs
-- Check what's in the course_enrollments table

-- 1. Check all course enrollments
SELECT 
  ce.id,
  ce.course_id,
  ce.student_id,
  ce.status,
  ce.created_at,
  ic.title as course_title,
  ic.institution_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
ORDER BY ce.created_at DESC;

-- 2. Check institution courses
SELECT 
  id,
  title,
  institution_id,
  status,
  created_at
FROM institution_courses
ORDER BY created_at DESC;

-- 3. Check institution batches
SELECT 
  id,
  batch_name,
  course_id,
  institution_id,
  created_at
FROM institution_batches
ORDER BY created_at DESC;

-- 4. Count enrollments per course (same logic as loadCourses)
SELECT 
  ic.id as course_id,
  ic.title as course_title,
  ic.institution_id,
  COUNT(ce.id) as enrollment_count
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ic.id, ic.title, ic.institution_id
ORDER BY ic.created_at DESC;

-- 5. Count enrollments per batch's course (same logic as loadBatches)
SELECT 
  ib.id as batch_id,
  ib.batch_name,
  ib.course_id,
  ib.institution_id,
  ic.title as course_title,
  COUNT(ce.id) as enrollment_count
FROM institution_batches ib
LEFT JOIN institution_courses ic ON ib.course_id = ic.id
LEFT JOIN course_enrollments ce ON ib.course_id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ib.id, ib.batch_name, ib.course_id, ib.institution_id, ic.title
ORDER BY ib.created_at DESC;

-- 6. Check if there are any differences in the queries
SELECT 'COURSES_TAB_LOGIC' as query_type, 
       ic.id as course_id,
       ic.title,
       COUNT(ce.id) as count
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ic.id, ic.title

UNION ALL

SELECT 'BATCHES_TAB_LOGIC' as query_type,
       ib.course_id,
       ic.title,
       COUNT(ce.id) as count
FROM institution_batches ib
LEFT JOIN institution_courses ic ON ib.course_id = ic.id
LEFT JOIN course_enrollments ce ON ib.course_id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ib.course_id, ic.title;

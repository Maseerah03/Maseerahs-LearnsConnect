-- Insert only the missing tutors (6, 7, 8, 9) that weren't inserted in Step 1
-- This script will insert only the tutors that are missing from the first batch
-- Copy and paste this entire script into Supabase SQL editor

-- Insert the missing tutors (6, 7, 8, 9) - skipping the ones that already exist
INSERT INTO tutor_profiles (
    user_id, full_name, bio, subjects, hourly_rate, experience_years, education, 
    qualifications, title, mobile_number, date_of_birth, gender, pin_code,
    highest_qualification, university_name, year_of_passing, percentage,
    teaching_experience, currently_teaching, current_teaching_place,
    student_levels, curriculum, class_type, max_travel_distance, class_size,
    available_days, individual_fee, group_fee, home_tuition_fee,
    demo_class, demo_class_fee, assignment_help, test_preparation,
    homework_support, weekend_classes, profile_headline, teaching_methodology,
    why_choose_me, languages, response_time_hours, hourly_rate_min, hourly_rate_max,
    teaching_mode, availability, verified, profile_completion_percentage,
    rating, demo_available, timezone, weekly_schedule, status, created_at, updated_at
) VALUES
('b6666666-6666-6666-6666-666666666666', 'Shri Ram Prasad', 'Hindi language expert with 8 years of teaching experience. Specialized in Hindi Literature, Grammar, and Poetry.', 
 ARRAY['Hindi', 'Hindi Literature', 'Sanskrit'], 500, 8, 'M.A Hindi Literature', 'M.A Hindi, B.Ed, Sanskrit Certificate', 'Shri', '9876543215', '1987-11-30', 'Male', '110005',
 'M.A', 'Delhi University', 2012, 76.5, '8+ years', true, 'Delhi University', 
 '["Primary", "Secondary", "Higher Secondary"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'Individual', 20, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 500, 350, 600, true, 0, true, true, true, true,
 'Expert Hindi Tutor - Literature & Grammar Specialist', 'Traditional teaching methods with modern approach', 'Deep knowledge of Hindi literature and classical texts',
 '["Hindi", "English"]'::jsonb, 3, 400, 600, 'offline', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 82, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b7777777-7777-7777-7777-777777777777', 'Kumari Meera Devi', 'Sanskrit and Hindi teacher with 6 years of experience. Expert in classical literature and ancient texts.', 
 ARRAY['Sanskrit', 'Hindi', 'Classical Literature'], 450, 6, 'M.A Sanskrit', 'M.A Sanskrit, B.Ed, Hindi Certificate', 'Kumari', '9876543216', '1990-04-12', 'Female', '221001',
 'M.A', 'Banaras Hindu University', 2014, 81.2, '6+ years', true, 'Banaras Hindu University', 
 '["Primary", "Secondary", "Higher Secondary"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'Both', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 450, 300, 550, true, 0, true, true, true, true,
 'Expert Sanskrit Tutor - Classical Literature Specialist', 'Traditional Vedic teaching methods with modern techniques', 'Deep understanding of Sanskrit grammar and classical texts',
 '["Hindi", "Sanskrit", "English"]'::jsonb, 4, 350, 550, 'both', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 78, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b8888888-8888-8888-8888-888888888888', 'Dr. Amitabh Chatterjee', 'History professor specializing in Indian History, World History, and Political Science. PhD from Jadavpur University.', 
 ARRAY['History', 'Political Science', 'World History'], 650, 11, 'PhD in History', 'PhD History, M.A History, B.Ed', 'Dr.', '9876543217', '1983-09-05', 'Male', '700064',
 'PhD', 'Jadavpur University', 2009, 83.7, '11+ years', true, 'Jadavpur University', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'Individual', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 650, 450, 0, true, 0, true, true, true, true,
 'Expert History Tutor - Indian & World History Specialist', 'Storytelling approach with historical context and analysis', 'Extensive research experience in Indian and world history',
 '["English", "Bengali", "Hindi"]'::jsonb, 2, 550, 750, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 87, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b9999999-9999-9999-9999-999999999999', 'Prof. Geeta Menon', 'Geography expert with 9 years of experience. Specialized in Physical Geography, Human Geography, and Environmental Studies.', 
 ARRAY['Geography', 'Environmental Studies', 'Physical Geography'], 550, 9, 'M.Sc Geography', 'M.Sc Geography, B.Ed, Environmental Science Certificate', 'Prof.', '9876543218', '1986-01-22', 'Female', '682031',
 'M.Sc', 'Kerala University', 2011, 80.4, '9+ years', true, 'Kerala University', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'Group', 25, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 550, 400, 650, true, 0, true, true, true, true,
 'Expert Geography Tutor - Physical & Human Geography Specialist', 'Map-based learning with real-world examples', 'Strong foundation in geographical concepts with environmental awareness',
 '["English", "Malayalam", "Hindi"]'::jsonb, 3, 450, 650, 'offline', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 84, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW());

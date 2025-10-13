-- Batch 1: First 10 Complete Dummy Tutor Profiles (FIXED)
-- This script creates auth users first, then profiles and tutor_profiles
-- Copy and paste this entire script into Supabase SQL editor

-- Step 1: Create auth users (this needs to be done through Supabase Auth API or manually)
-- For now, we'll create profiles with existing user_ids or use a different approach

-- Let's use the existing user_ids from your current data and create new ones
-- First, let's check what user_ids already exist and create new ones

-- Insert into profiles table with new user_ids
INSERT INTO profiles (user_id, role, full_name, email, phone, bio, city, area, primary_language, gender, profile_photo_url, created_at, updated_at) VALUES
('b1111111-1111-1111-1111-111111111111', 'tutor', 'Dr. Priya Sharma', 'priya.sharma@email.com', 9876543210, 'Experienced Mathematics professor with 15+ years of teaching experience. Specialized in Calculus, Algebra, and Statistics. PhD in Mathematics from IIT Delhi.', 'Delhi', 'Connaught Place', 'English', 2, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', NOW(), NOW()),
('b2222222-2222-2222-2222-222222222222', 'tutor', 'Prof. Rajesh Kumar', 'rajesh.kumar@email.com', 9876543211, 'Physics expert with 12 years of experience. Specialized in Mechanics, Thermodynamics, and Quantum Physics. M.Sc Physics from Delhi University.', 'Mumbai', 'Andheri West', 'English', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NOW(), NOW()),
('b3333333-3333-3333-3333-333333333333', 'tutor', 'Dr. Anjali Patel', 'anjali.patel@email.com', 9876543212, 'Chemistry professor with expertise in Organic, Inorganic, and Physical Chemistry. PhD in Chemistry from IISc Bangalore.', 'Bangalore', 'Koramangala', 'English', 2, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', NOW(), NOW()),
('b4444444-4444-4444-4444-444444444444', 'tutor', 'Dr. Vikram Singh', 'vikram.singh@email.com', 9876543213, 'Biology expert specializing in Botany, Zoology, and Human Anatomy. PhD in Life Sciences from JNU Delhi.', 'Chennai', 'Anna Nagar', 'English', 1, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', NOW(), NOW()),
('b5555555-5555-5555-5555-555555555555', 'tutor', 'Ms. Sarah Johnson', 'sarah.johnson@email.com', 9876543214, 'English Literature professor with 10 years of experience. Specialized in British Literature, Creative Writing, and Communication Skills.', 'Kolkata', 'Park Street', 'English', 2, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', NOW(), NOW()),
('b6666666-6666-6666-6666-666666666666', 'tutor', 'Shri Ram Prasad', 'ram.prasad@email.com', 9876543215, 'Hindi language expert with 8 years of teaching experience. Specialized in Hindi Literature, Grammar, and Poetry.', 'Delhi', 'Karol Bagh', 'Hindi', 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', NOW(), NOW()),
('b7777777-7777-7777-7777-777777777777', 'tutor', 'Kumari Meera Devi', 'meera.devi@email.com', 9876543216, 'Sanskrit and Hindi teacher with 6 years of experience. Expert in classical literature and ancient texts.', 'Varanasi', 'Assi Ghat', 'Hindi', 2, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', NOW(), NOW()),
('b8888888-8888-8888-8888-888888888888', 'tutor', 'Dr. Amitabh Chatterjee', 'amitabh.chatterjee@email.com', 9876543217, 'History professor specializing in Indian History, World History, and Political Science. PhD from Jadavpur University.', 'Kolkata', 'Salt Lake', 'English', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NOW(), NOW()),
('b9999999-9999-9999-9999-999999999999', 'tutor', 'Prof. Geeta Menon', 'geeta.menon@email.com', 9876543218, 'Geography expert with 9 years of experience. Specialized in Physical Geography, Human Geography, and Environmental Studies.', 'Kochi', 'Marine Drive', 'English', 2, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', NOW(), NOW()),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tutor', 'Dr. Suresh Reddy', 'suresh.reddy@email.com', 9876543219, 'Economics professor with expertise in Microeconomics, Macroeconomics, and Indian Economy. PhD from Osmania University.', 'Hyderabad', 'Banjara Hills', 'English', 1, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', NOW(), NOW());

-- Insert into tutor_profiles table
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
('b1111111-1111-1111-1111-111111111111', 'Dr. Priya Sharma', 'Experienced Mathematics professor with 15+ years of teaching experience. Specialized in Calculus, Algebra, and Statistics. PhD in Mathematics from IIT Delhi.', 
 ARRAY['Mathematics', 'Statistics', 'Calculus'], 800, 15, 'PhD in Mathematics', 'PhD Mathematics, M.Sc Mathematics, B.Ed', 'Dr.', '9876543210', '1980-05-15', 'Female', '110001',
 'PhD', 'IIT Delhi', 2005, 85.5, '15+ years', true, 'IIT Delhi', 
 '["Higher Secondary", "Graduate", "Professional"]'::jsonb, '["CBSE", "ICSE", "IB"]'::jsonb, 'online', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 800, 600, 0, true, 0, true, true, true, true,
 'Expert Mathematics Tutor with 15+ Years Experience', 'Interactive problem-solving approach with real-world applications', 'Proven track record of helping students achieve top scores in competitive exams',
 '["English", "Hindi"]'::jsonb, 2, 700, 900, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 95, 5, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b2222222-2222-2222-2222-222222222222', 'Prof. Rajesh Kumar', 'Physics expert with 12 years of experience. Specialized in Mechanics, Thermodynamics, and Quantum Physics. M.Sc Physics from Delhi University.', 
 ARRAY['Physics', 'Mechanics', 'Thermodynamics'], 700, 12, 'M.Sc Physics', 'M.Sc Physics, B.Ed, NET Qualified', 'Prof.', '9876543211', '1982-08-20', 'Male', '400053',
 'M.Sc', 'Delhi University', 2008, 82.3, '12+ years', true, 'Delhi University', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'visit_student', 15, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 700, 500, 800, true, 0, true, true, true, true,
 'Experienced Physics Tutor - Mechanics & Thermodynamics Expert', 'Conceptual learning with practical demonstrations', 'Strong foundation in physics concepts with excellent problem-solving skills',
 '["English", "Hindi"]'::jsonb, 4, 600, 800, 'visit_student', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 90, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b3333333-3333-3333-3333-333333333333', 'Dr. Anjali Patel', 'Chemistry professor with expertise in Organic, Inorganic, and Physical Chemistry. PhD in Chemistry from IISc Bangalore.', 
 ARRAY['Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'], 750, 14, 'PhD in Chemistry', 'PhD Chemistry, M.Sc Chemistry, B.Ed', 'Dr.', '9876543212', '1979-12-10', 'Female', '560034',
 'PhD', 'IISc Bangalore', 2006, 88.7, '14+ years', true, 'IISc Bangalore', 
 '["Higher Secondary", "Graduate", "Professional"]'::jsonb, '["CBSE", "ICSE", "IB"]'::jsonb, 'tutor_home', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 750, 550, 850, true, 0, true, true, true, true,
 'Expert Chemistry Tutor - Organic & Inorganic Chemistry Specialist', 'Laboratory-based learning with theoretical foundation', 'Extensive research experience with practical chemistry applications',
 '["English", "Hindi"]'::jsonb, 3, 650, 850, 'tutor_home', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 92, 5, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b4444444-4444-4444-4444-444444444444', 'Dr. Vikram Singh', 'Biology expert specializing in Botany, Zoology, and Human Anatomy. PhD in Life Sciences from JNU Delhi.', 
 ARRAY['Biology', 'Botany', 'Zoology'], 650, 13, 'PhD in Life Sciences', 'PhD Life Sciences, M.Sc Biology, B.Ed', 'Dr.', '9876543213', '1981-03-25', 'Male', '600040',
 'PhD', 'JNU Delhi', 2007, 84.2, '13+ years', true, 'JNU Delhi', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'online', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 650, 450, 0, true, 0, true, true, true, true,
 'Expert Biology Tutor - Botany & Zoology Specialist', 'Visual learning with diagrams and practical examples', 'Strong foundation in biological concepts with research experience',
 '["English", "Hindi"]'::jsonb, 2, 550, 750, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 88, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b5555555-5555-5555-5555-555555555555', 'Ms. Sarah Johnson', 'English Literature professor with 10 years of experience. Specialized in British Literature, Creative Writing, and Communication Skills.', 
 ARRAY['English', 'Literature', 'Creative Writing'], 600, 10, 'M.A English Literature', 'M.A English, B.Ed, IELTS Certified', 'Ms.', '9876543214', '1985-07-18', 'Female', '700016',
 'M.A', 'Jadavpur University', 2010, 79.8, '10+ years', true, 'Jadavpur University', 
 '["Primary", "Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "IB"]'::jsonb, 'online', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 600, 400, 0, true, 0, true, true, true, true,
 'Expert English Tutor - Literature & Communication Specialist', 'Interactive learning with focus on practical communication', 'Excellent command over English language with creative writing expertise',
 '["English"]'::jsonb, 1, 500, 700, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 85, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b6666666-6666-6666-6666-666666666666', 'Shri Ram Prasad', 'Hindi language expert with 8 years of teaching experience. Specialized in Hindi Literature, Grammar, and Poetry.', 
 ARRAY['Hindi', 'Hindi Literature', 'Sanskrit'], 500, 8, 'M.A Hindi Literature', 'M.A Hindi, B.Ed, Sanskrit Certificate', 'Shri', '9876543215', '1987-11-30', 'Male', '110005',
 'M.A', 'Delhi University', 2012, 76.5, '8+ years', true, 'Delhi University', 
 '["Primary", "Secondary", "Higher Secondary"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'visit_student', 20, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 500, 350, 600, true, 0, true, true, true, true,
 'Expert Hindi Tutor - Literature & Grammar Specialist', 'Traditional teaching methods with modern approach', 'Deep knowledge of Hindi literature and classical texts',
 '["Hindi", "English"]'::jsonb, 3, 400, 600, 'visit_student', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 82, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b7777777-7777-7777-7777-777777777777', 'Kumari Meera Devi', 'Sanskrit and Hindi teacher with 6 years of experience. Expert in classical literature and ancient texts.', 
 ARRAY['Sanskrit', 'Hindi', 'Classical Literature'], 450, 6, 'M.A Sanskrit', 'M.A Sanskrit, B.Ed, Hindi Certificate', 'Kumari', '9876543216', '1990-04-12', 'Female', '221001',
 'M.A', 'Banaras Hindu University', 2014, 81.2, '6+ years', true, 'Banaras Hindu University', 
 '["Primary", "Secondary", "Higher Secondary"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'tutor_home', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 450, 300, 550, true, 0, true, true, true, true,
 'Expert Sanskrit Tutor - Classical Literature Specialist', 'Traditional Vedic teaching methods with modern techniques', 'Deep understanding of Sanskrit grammar and classical texts',
 '["Hindi", "Sanskrit", "English"]'::jsonb, 4, 350, 550, 'tutor_home', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 78, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "18:00-20:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b8888888-8888-8888-8888-888888888888', 'Dr. Amitabh Chatterjee', 'History professor specializing in Indian History, World History, and Political Science. PhD from Jadavpur University.', 
 ARRAY['History', 'Political Science', 'World History'], 650, 11, 'PhD in History', 'PhD History, M.A History, B.Ed', 'Dr.', '9876543217', '1983-09-05', 'Male', '700064',
 'PhD', 'Jadavpur University', 2009, 83.7, '11+ years', true, 'Jadavpur University', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'online', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 650, 450, 0, true, 0, true, true, true, true,
 'Expert History Tutor - Indian & World History Specialist', 'Storytelling approach with historical context and analysis', 'Extensive research experience in Indian and world history',
 '["English", "Bengali", "Hindi"]'::jsonb, 2, 550, 750, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 87, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "19:00-21:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('b9999999-9999-9999-9999-999999999999', 'Prof. Geeta Menon', 'Geography expert with 9 years of experience. Specialized in Physical Geography, Human Geography, and Environmental Studies.', 
 ARRAY['Geography', 'Environmental Studies', 'Physical Geography'], 550, 9, 'M.Sc Geography', 'M.Sc Geography, B.Ed, Environmental Science Certificate', 'Prof.', '9876543218', '1986-01-22', 'Female', '682031',
 'M.Sc', 'Kerala University', 2011, 80.4, '9+ years', true, 'Kerala University', 
 '["Secondary", "Higher Secondary", "Graduate"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'visit_student', 25, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb, 550, 400, 650, true, 0, true, true, true, true,
 'Expert Geography Tutor - Physical & Human Geography Specialist', 'Map-based learning with real-world examples', 'Strong foundation in geographical concepts with environmental awareness',
 '["English", "Malayalam", "Hindi"]'::jsonb, 3, 450, 650, 'visit_student', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 84, 4, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "tuesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "wednesday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "thursday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "friday": {"slots": ["10:00-12:00", "15:00-17:00", "18:00-20:00"], "available": true}, "saturday": {"slots": ["10:00-12:00", "15:00-17:00"], "available": true}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW()),

('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. Suresh Reddy', 'Economics professor with expertise in Microeconomics, Macroeconomics, and Indian Economy. PhD from Osmania University.', 
 ARRAY['Economics', 'Microeconomics', 'Macroeconomics'], 700, 12, 'PhD in Economics', 'PhD Economics, M.A Economics, B.Ed', 'Dr.', '9876543219', '1982-06-14', 'Male', '500034',
 'PhD', 'Osmania University', 2008, 86.1, '12+ years', true, 'Osmania University', 
 '["Higher Secondary", "Graduate", "Professional"]'::jsonb, '["CBSE", "ICSE", "State Board"]'::jsonb, 'online', 0, 1,
 '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, 700, 500, 0, true, 0, true, true, true, true,
 'Expert Economics Tutor - Micro & Macro Economics Specialist', 'Case study approach with real-world economic examples', 'Extensive research experience in Indian and global economics',
 '["English", "Telugu", "Hindi"]'::jsonb, 2, 600, 800, 'online', '{"morning": true, "afternoon": true, "evening": true}'::jsonb, true, 91, 5, true, 'Asia/Kolkata',
 '{"monday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "tuesday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "wednesday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "thursday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "friday": {"slots": ["09:00-11:00", "14:00-16:00", "19:00-21:00"], "available": true}, "saturday": {"slots": [], "available": false}, "sunday": {"slots": [], "available": false}}'::jsonb, 'approved', NOW(), NOW());

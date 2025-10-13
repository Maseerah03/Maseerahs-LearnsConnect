-- Batch 2: Next 10 Dummy Tutor Profiles (Tutors 11-20) - FIXED VERSION
-- Removed non-existent columns: degree, certifications, title, phone_number, date_of_birth, gender, pincode, highest_qualification, university, graduation_year, percentage, experience_summary, is_verified, institution_name, academic_levels, boards, class_type, max_students_per_batch, min_students_per_batch, available_days, online_fee, home_visit_fee, home_tuition_fee, accepts_online, group_discount, accepts_home_visit, accepts_home_tuition, accepts_group_classes, teaching_approach, teaching_methodology, achievements, languages, demo_class_fee, max_travel_distance, hourly_rate_max, teaching_mode, availability, is_active, rating, updated_at, total_students_taught, additional_info, verified, timezone, availability_schedule

INSERT INTO tutor_profiles (
    user_id,
    full_name,
    bio,
    profile_photo_url,
    subjects,
    hourly_rate_min,
    experience_years,
    qualifications,
    status,
    created_at
) VALUES 
-- Tutor 11: Dr. Rajesh Kumar - Physics Expert
(
    'c1111111-1111-1111-1111-111111111111',
    'Dr. Rajesh Kumar',
    'Renowned Physics professor with 18+ years of experience in teaching JEE, NEET, and competitive exams. Specialized in Mechanics, Thermodynamics, and Modern Physics. PhD in Physics from IIT Bombay with multiple research publications.',
    null,
    ARRAY['Physics', 'Mechanics', 'Thermodynamics', 'Modern Physics'],
    900.00,
    18,
    'PhD in Physics, M.Sc Physics, B.Ed',
    'approved',
    NOW()
),

-- Tutor 12: Prof. Sunita Agarwal - Computer Science Expert
(
    'c2222222-2222-2222-2222-222222222222',
    'Prof. Sunita Agarwal',
    'Computer Science professor with expertise in Programming, Data Structures, and Software Engineering. 16+ years of experience in both academia and industry. M.Tech from IIT Delhi with specialization in Machine Learning.',
    null,
    ARRAY['Programming', 'Data Structures', 'Algorithms', 'Machine Learning', 'Python', 'Java'],
    850.00,
    16,
    'M.Tech Computer Science, B.Tech IT, Industry Certifications',
    'approved',
    NOW()
),

-- Tutor 13: Dr. Amit Singh - History & Political Science
(
    'c3333333-3333-3333-3333-333333333333',
    'Dr. Amit Singh',
    'History and Political Science professor with 14+ years of experience. Specialized in Indian History, World History, and Political Theory. PhD from JNU Delhi with expertise in UPSC preparation.',
    null,
    ARRAY['History', 'Political Science', 'Indian History', 'World History', 'UPSC Preparation'],
    700.00,
    14,
    'PhD History, M.A Political Science, B.Ed',
    'approved',
    NOW()
),

-- Tutor 14: Ms. Priya Sharma - Psychology & Sociology
(
    'c4444444-4444-4444-4444-444444444444',
    'Ms. Priya Sharma',
    'Psychology and Sociology expert with 12+ years of experience. Specialized in Clinical Psychology, Social Psychology, and Research Methods. M.Phil in Psychology from Delhi University.',
    null,
    ARRAY['Psychology', 'Sociology', 'Clinical Psychology', 'Social Psychology', 'Research Methods'],
    650.00,
    12,
    'M.Phil Psychology, M.A Sociology, B.Ed',
    'approved',
    NOW()
),

-- Tutor 15: Dr. Vikram Mehta - Geography & Environmental Science
(
    'c5555555-5555-5555-5555-555555555555',
    'Dr. Vikram Mehta',
    'Geography and Environmental Science professor with 15+ years of experience. Specialized in Physical Geography, Human Geography, and Environmental Studies. PhD from JNU Delhi with field research experience.',
    null,
    ARRAY['Geography', 'Environmental Science', 'Physical Geography', 'Human Geography', 'GIS'],
    750.00,
    15,
    'PhD Geography, M.Sc Environmental Science, B.Ed',
    'approved',
    NOW()
),

-- Tutor 16: Prof. Neha Gupta - Business Studies & Economics
(
    'c6666666-6666-6666-6666-666666666666',
    'Prof. Neha Gupta',
    'Business Studies and Economics professor with 13+ years of experience. Specialized in Microeconomics, Macroeconomics, and Business Management. MBA from IIM Ahmedabad with corporate experience.',
    null,
    ARRAY['Business Studies', 'Economics', 'Microeconomics', 'Macroeconomics', 'Business Management'],
    800.00,
    13,
    'MBA Finance, M.A Economics, Industry Experience',
    'approved',
    NOW()
),

-- Tutor 17: Dr. Ravi Kumar - Sanskrit & Hindi Literature
(
    'c7777777-7777-7777-7777-777777777777',
    'Dr. Ravi Kumar',
    'Sanskrit and Hindi Literature professor with 17+ years of experience. Specialized in Classical Sanskrit, Modern Hindi Literature, and Indian Philosophy. PhD from Banaras Hindu University.',
    null,
    ARRAY['Sanskrit', 'Hindi Literature', 'Classical Sanskrit', 'Modern Hindi', 'Indian Philosophy'],
    600.00,
    17,
    'PhD Sanskrit, M.A Hindi Literature, B.Ed',
    'approved',
    NOW()
),

-- Tutor 18: Ms. Anjali Patel - Art & Design
(
    'c8888888-8888-8888-8888-888888888888',
    'Ms. Anjali Patel',
    'Art and Design expert with 11+ years of experience. Specialized in Fine Arts, Graphic Design, and Digital Art. MFA from JJ School of Art with international exhibitions.',
    null,
    ARRAY['Art', 'Design', 'Fine Arts', 'Graphic Design', 'Digital Art', 'Painting'],
    550.00,
    11,
    'MFA Fine Arts, BFA Painting, Design Certifications',
    'approved',
    NOW()
),

-- Tutor 19: Dr. Suresh Reddy - Telugu & Regional Languages
(
    'c9999999-9999-9999-9999-999999999999',
    'Dr. Suresh Reddy',
    'Telugu and Regional Languages professor with 16+ years of experience. Specialized in Classical Telugu, Modern Telugu Literature, and Comparative Literature. PhD from Osmania University.',
    null,
    ARRAY['Telugu', 'Regional Languages', 'Classical Telugu', 'Modern Telugu', 'Comparative Literature'],
    500.00,
    16,
    'PhD Telugu Literature, M.A Comparative Literature, B.Ed',
    'approved',
    NOW()
),

-- Tutor 20: Prof. Meera Joshi - Music & Performing Arts
(
    'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Prof. Meera Joshi',
    'Music and Performing Arts expert with 14+ years of experience. Specialized in Classical Music, Western Music, and Music Theory. M.Mus from Delhi University with international performances.',
    null,
    ARRAY['Music', 'Classical Music', 'Western Music', 'Music Theory', 'Vocal Training', 'Instrumental'],
    600.00,
    14,
    'M.Mus Classical Music, B.Mus Vocal, Performance Certifications',
    'approved',
    NOW()
);

# Quick Fix Steps

## ✅ Fixed Issues:

### 1. Syntax Error - FIXED
- **Problem**: Duplicate `X` import in StudentDashboard.tsx
- **Solution**: Removed duplicate import on line 80
- **Status**: ✅ Fixed - Build now compiles successfully

### 2. Table Not Found - NEEDS ACTION
- **Problem**: `institution_student_enquiries` table doesn't exist in Supabase
- **Solution**: Run the SQL script to create the table
- **Status**: ⏳ Action Required

## 🚀 Next Steps:

### Step 1: Create the Table
Run this SQL in your Supabase SQL Editor:

```sql
-- Create institution_student_enquiries table
CREATE TABLE institution_student_enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE institution_student_enquiries 
ADD CONSTRAINT institution_student_enquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE institution_student_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can create enquiries" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institutions can view their enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update enquiry status" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );
```

### Step 2: Test the Contact Form
After creating the table:
1. Go to Contact Institution section
2. Click "Contact Institution" on any institution
3. Fill out the form
4. Submit - should work without errors

## 🎯 Expected Result:
- ✅ No more syntax errors
- ✅ Contact form works properly
- ✅ Data saves to database
- ✅ Institution dashboard shows inquiries

## 📁 Files Ready:
- `create_table_now.sql` - Simple table creation script
- All code fixes are complete and pushed

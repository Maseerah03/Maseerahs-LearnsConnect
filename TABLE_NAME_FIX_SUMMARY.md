# Table Name Fix Summary

## 🔍 Problem Identified
The institution dashboard's "Student Inquiries" section was trying to fetch from the wrong table name:
- **Incorrect**: `institution_student_inquiries` (with "inquiries")
- **Correct**: `institution_student_enquiries` (with "enquiries")

## ✅ Files Fixed

### 1. `src/pages/InstitutionDashboardNew.tsx`
- **Line 1432**: Fixed `fetchInquiries` function table reference
- **Line 1512**: Fixed `handleStatusChange` function table reference

### 2. `src/hooks/useInquiries.ts`
- **Line 35**: Fixed `fetchInquiries` function table reference
- **Line 170**: Fixed `updateInquiryStatus` function table reference

## 🎯 What This Fixes

### Student Side (Contact Form):
- ✅ Students can now submit inquiries through the contact form
- ✅ Data gets saved to the correct `institution_student_enquiries` table
- ✅ No more "table not found" errors

### Institution Side (Student Inquiries Dashboard):
- ✅ Institutions can now view student inquiries in their dashboard
- ✅ Status updates work correctly
- ✅ All inquiry management features function properly

## 📊 Complete Data Flow

1. **Student** fills contact form → Data saved to `institution_student_enquiries`
2. **Institution** views inquiries → Fetches from `institution_student_enquiries`
3. **Institution** updates status → Updates `institution_student_enquiries`
4. **System** works end-to-end with correct table references

## 🚀 Result

The complete inquiry system now works properly:
- Student contact form ✅
- Institution inquiry dashboard ✅
- Status management ✅
- Database integration ✅

All table references are now consistent and point to the correct `institution_student_enquiries` table!

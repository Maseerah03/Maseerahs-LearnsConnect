# How to Contact Supabase Support

## 🚨 **URGENT: Schema Cache Bug Report**

### **Contact Methods:**

#### **1. GitHub Issues (Recommended)**
- **URL:** https://github.com/supabase/supabase/issues
- **Title:** `[BUG] Schema cache not updating - PGRST204/PGRST205 errors persist`
- **Labels:** `bug`, `postgrest`, `schema-cache`

#### **2. Supabase Discord Community**
- **URL:** https://discord.supabase.com/
- **Channel:** `#help` or `#bugs`
- **Tag:** `@supabase-team` or `@moderators`

#### **3. Supabase Support Email**
- **Email:** support@supabase.com
- **Subject:** `URGENT: Schema Cache Bug - PGRST204/PGRST205 Errors`

#### **4. Supabase Community Forum**
- **URL:** https://github.com/supabase/supabase/discussions
- **Category:** `Bug Reports`

---

## 📝 **Bug Report Template**

### **Title:**
```
[BUG] Schema cache not updating - PGRST204/PGRST205 errors persist for 10+ hours
```

### **Description:**
```
I'm experiencing a persistent schema cache issue where:

1. Table `student_inquiries` exists in database
2. All columns exist and are properly configured
3. RLS policies are correctly set up
4. Permissions are granted to all roles
5. But API calls return PGRST204/PGRST205 errors

Error: "Could not find the 'institution_id' column of 'student_inquiries' in the schema cache"

This has been ongoing for 10+ hours despite:
- Multiple schema cache refreshes (NOTIFY pgrst, 'reload schema')
- Dropping and recreating the table
- Disabling/enabling RLS
- Granting all possible permissions
- Trying different table names

Project ID: mhukvyjukajzrcqisycs
Table: student_inquiries
```

### **Steps to Reproduce:**
```
1. Create table `student_inquiries` with columns: id, institution_id, student_name, student_email, course_interest, message, status, created_at
2. Grant permissions to anon, authenticated, public roles
3. Try to insert data via Supabase client
4. Get PGRST204 error about missing column in schema cache
```

### **Expected Behavior:**
```
API should recognize the table and columns immediately after creation
```

### **Actual Behavior:**
```
API returns schema cache errors even though table exists in database
```

### **Environment:**
```
- Supabase Project: mhukvyjukajzrcqisycs
- Region: (your region)
- Plan: (your plan)
- Browser: (your browser)
- Supabase JS Version: (your version)
```

### **Additional Context:**
```
This is blocking production functionality. The contact form on my website cannot submit inquiries to institutions.

I've tried every suggested solution:
- Schema cache refresh
- Table recreation
- Permission grants
- RLS policy changes
- Different table names

The issue persists across multiple attempts over 10+ hours.
```

---

## 🚀 **Quick Contact Links:**

- **GitHub Issues:** https://github.com/supabase/supabase/issues/new?template=bug_report.md
- **Discord:** https://discord.supabase.com/
- **Email:** support@supabase.com
- **Forum:** https://github.com/supabase/supabase/discussions

---

## 💡 **Pro Tips:**

1. **Use GitHub Issues** - Most likely to get developer attention
2. **Tag as URGENT** - This is blocking production
3. **Include Project ID** - Helps them debug faster
4. **Mention 10+ hours** - Shows severity
5. **Reference PGRST204/PGRST205** - These are specific PostgREST errors

---

## 🔥 **If Still No Response:**

1. **Tweet at @supabase** with your issue
2. **Post on Reddit** r/supabase
3. **Create a new Supabase project** as temporary workaround
4. **Use direct PostgreSQL connection** to bypass API

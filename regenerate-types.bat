@echo off
echo Regenerating Supabase types...

REM Install Supabase CLI if not already installed
npm install -g supabase

REM Generate types
supabase gen types typescript --project-id mhukvyjukajzrcqisycs --schema public > src/integrations/supabase/types.ts

echo Types regenerated successfully!
echo Please restart your development server.
pause

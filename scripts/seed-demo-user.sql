-- This script seeds a demo super_admin user
-- Note: In production, use Supabase Auth UI or programmatic signup

-- Insert a test profile (the actual auth user would need to be created through Supabase Auth)
-- For demo purposes, we're creating a placeholder that shows how the system works

-- Example: Create a profile for a hospital admin
INSERT INTO public.profiles (id, full_name, role, hospital_id)
SELECT
  (SELECT hospitals.id FROM hospitals LIMIT 1),
  'Demo Admin',
  'super_admin',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'super_admin'
)
LIMIT 1;

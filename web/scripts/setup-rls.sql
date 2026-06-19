-- Run this in your Supabase SQL Editor

-- 1. Add user_id to the complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Update existing rows (if you want them assigned to a specific user, otherwise they will be unassigned or you can delete them)
-- Example: UPDATE complaints SET user_id = 'your-user-uuid-here' WHERE user_id IS NULL;

-- 3. Enable Row Level Security (RLS) on the complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 4. Create policies so agents can only interact with their own records
-- Agents can ONLY SELECT their own records
CREATE POLICY "Agents can view their own records" ON complaints
  FOR SELECT USING (auth.uid() = user_id);

-- Agents can ONLY INSERT their own records
CREATE POLICY "Agents can insert their own records" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agents can ONLY UPDATE their own records
CREATE POLICY "Agents can update their own records" ON complaints
  FOR UPDATE USING (auth.uid() = user_id);

-- Agents can ONLY DELETE their own records
CREATE POLICY "Agents can delete their own records" ON complaints
  FOR DELETE USING (auth.uid() = user_id);

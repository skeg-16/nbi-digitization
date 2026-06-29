-- Run this in your Supabase SQL Editor

-- 1. Add user_id to the complaints table (if it doesn't exist)
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Enable Row Level Security (RLS) on the complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Agents can view their own records" ON complaints;
DROP POLICY IF EXISTS "Agents can insert their own records" ON complaints;
DROP POLICY IF EXISTS "Agents can update their own records" ON complaints;
DROP POLICY IF EXISTS "Agents can delete their own records" ON complaints;
DROP POLICY IF EXISTS "Managers have full access" ON complaints;

-- 4. Create policies for Agents (can only interact with their own records)
CREATE POLICY "Agents can view their own records" ON complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can insert their own records" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents can update their own records" ON complaints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agents can delete their own records" ON complaints FOR DELETE USING (auth.uid() = user_id);

-- 5. Create policy for Managers (full access to all records based on metadata)
CREATE POLICY "Managers have full access" ON complaints 
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'manager' );

-- 6. Update existing rows with a valid User ID so they aren't lost
-- (Using the first UUID from your list to take ownership of old unassigned records)
UPDATE complaints SET user_id = '865ae1cb-26fd-4c20-b3a9-70ce116a6d85' WHERE user_id IS NULL;

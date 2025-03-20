-- Add RLS policy to allow managers to update employee profiles
CREATE POLICY "Allow managers to update profiles" 
ON profiles 
FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'manager'))
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'manager'));


import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or key in environment variables')
    return { success: false, error: 'Missing environment variables' }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.log('Creating database tables...')
      
      try {
        // Get SQL from file
        const sqlPath = path.join(process.cwd(), 'lib', 'database.sql')
        
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf8')
          
          // Run each statement individually
          const statements = sql.split(';').filter(stmt => stmt.trim() !== '')
          
          for (const statement of statements) {
            try {
              // Try direct query execution
              const { error } = await supabase.query(statement.trim())
              if (error) {
                console.error('Error executing SQL:', error)
              }
            } catch (err) {
              console.error('Error executing query:', err)
            }
          }
          
          // Verify table creation
          const { error: verifyError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
          
          if (!verifyError) {
            return { success: true }
          } else {
            console.error('Tables were not created successfully:', verifyError)
          }
        }
      } catch (err) {
        console.error('Error reading SQL file:', err)
      }
      
      // Fallback: Create profiles table directly
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE NOT NULL,
          full_name TEXT,
          headline TEXT,
          bio TEXT,
          avatar_url TEXT,
          company TEXT,
          position TEXT,
          location TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON profiles FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own profile" 
        ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" 
        ON profiles FOR UPDATE USING (auth.uid() = id);
      `)
      
      if (createError) {
        console.error('Error creating profiles table directly:', createError)
        return { success: false, error: createError }
      }
      
      return { success: true }
    } else {
      console.log('Profiles table already exists')
      return { success: true }
    }
  } catch (error) {
    console.error('Error setting up database:', error)
    return { success: false, error }
  }
}

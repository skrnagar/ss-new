
import { createClient } from '@supabase/supabase-js'

export async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key in environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Check if profiles table exists by trying to get one row
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.log('Creating profiles table...')
      
      // Create profiles table if it doesn't exist
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
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
          
          -- Set up RLS (Row Level Security)
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Public profiles are viewable by everyone"
            ON profiles FOR SELECT
            USING (true);
            
          CREATE POLICY "Users can insert their own profile"
            ON profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
            
          CREATE POLICY "Users can update their own profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
        `
      })
      
      if (createError) {
        console.error('Error creating profiles table:', createError)
      } else {
        console.log('Profiles table created successfully')
      }
    } else {
      console.log('Profiles table already exists')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error setting up database:', error)
    return { success: false, error }
  }
}

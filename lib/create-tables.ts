
import { createClient } from '@supabase/supabase-js'

export async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key in environment variables')
    return { success: false, error: 'Missing environment variables' }
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
      
      // Create profiles table
      const { error: createProfilesError } = await supabase
        .from('profiles')
        .insert([{ 
          id: '00000000-0000-0000-0000-000000000000',
          username: 'system',
          full_name: 'System Account'
        }])
        .select()
      
      if (createProfilesError && createProfilesError.code !== '23505') { // Ignore duplicate key error
        // If insert fails, try to create the table
        const { data, error } = await supabase.auth.admin.createUser({
          email: 'temp@example.com',
          password: 'temporaryPassword123',
          email_confirm: true
        })
        
        if (error) {
          console.error('Error creating temporary user:', error)
          return { success: false, error: 'Failed to create table structure' }
        }
        
        // Now that we have a user, try to insert a profile to trigger the table creation
        const userId = data.user.id
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId,
            username: 'temp_user',
            full_name: 'Temporary User'
          }])
        
        if (insertError && insertError.code !== '23505') {
          console.error('Error creating profile:', insertError)
          
          // Try with basic schema queries
          await supabase.schema('public')
            .createTable('profiles', [
              { name: 'id', type: 'uuid', primaryKey: true },
              { name: 'username', type: 'text', notNull: true, unique: true },
              { name: 'full_name', type: 'text' },
              { name: 'headline', type: 'text' },
              { name: 'bio', type: 'text' },
              { name: 'avatar_url', type: 'text' },
              { name: 'company', type: 'text' },
              { name: 'position', type: 'text' },
              { name: 'location', type: 'text' },
              { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
              { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' }
            ])
          
          // Clean up temporary user
          await supabase.auth.admin.deleteUser(userId)
        }
      }
      
      console.log('Database setup completed')
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

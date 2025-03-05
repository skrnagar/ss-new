
import { NextResponse } from 'next/server'
import { setupDatabase } from '@/lib/create-tables'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  return await setupDatabaseHandler()
}

export async function POST() {
  return await setupDatabaseHandler()
}

async function setupDatabaseHandler() {
  try {
    // Try the automated setup first
    const result = await setupDatabase()
    
    if (result?.success) {
      return NextResponse.json({ 
        message: 'Database tables created successfully via automated process' 
      })
    }
    
    // If automated setup fails, try manual SQL execution
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase credentials' 
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.log('Creating database with SQL script...')
      
      // Get the SQL from the database.sql file
      const sqlPath = path.join(process.cwd(), 'lib', 'database.sql')
      let sql = ''
      
      if (fs.existsSync(sqlPath)) {
        sql = fs.readFileSync(sqlPath, 'utf8')
      } else {
        // Use inline SQL as fallback
        sql = `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY,
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
          
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Public profiles are viewable by everyone" 
          ON profiles FOR SELECT USING (true);
          
          CREATE POLICY "Users can insert their own profile" 
          ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
          
          CREATE POLICY "Users can update own profile" 
          ON profiles FOR UPDATE USING (auth.uid() = id);
        `
      }
      
      // Execute individual SQL statements
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        try {
          // Using the REST API directly for SQL execution
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              query: statement.trim()
            })
          })
          
          console.log(`SQL execution status: ${response.status}`)
        } catch (err) {
          console.error('Error executing SQL:', err)
        }
      }
      
      return NextResponse.json({ 
        message: 'Database setup attempted via SQL script' 
      })
    }
    
    return NextResponse.json({ 
      message: 'Database tables already exist' 
    })
  } catch (error) {
    console.error('Error in setup-db route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}

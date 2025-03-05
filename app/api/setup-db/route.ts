import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function GET() {
  return await setupDatabaseHandler()
}

export async function POST(request) {
  return await setupDatabaseHandler()
}

async function setupDatabaseHandler() {
  try {
    console.log("Setup DB API route called")
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing")
      return NextResponse.json({ 
        error: 'Supabase credentials are missing' 
      }, { status: 500 })
    }

    console.log("Creating Supabase client")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (checkError) {
      console.log('Creating database tables...')

      // Get the SQL from the database.sql file
      const sqlPath = path.join(process.cwd(), 'lib', 'database.sql')
      let sql = ''

      if (fs.existsSync(sqlPath)) {
        console.log("Reading SQL file from:", sqlPath);
        sql = fs.readFileSync(sqlPath, 'utf8')
      } else {
        return NextResponse.json({ 
          error: 'SQL file not found' 
        }, { status: 500 })
      }

      // Execute each SQL statement separately
      const sqlStatements = sql.split(';').filter(stmt => stmt.trim() !== '')

      let failedStatements = [];

      for (const statement of sqlStatements) {
        try {
          // Try direct query execution
          const { error } = await supabase.query(statement.trim())
          if (error) {
            console.error('Error executing SQL statement:', error)
            failedStatements.push({ statement: statement.trim(), error })
          }
        } catch (err) {
          console.error('Error executing query:', err)
          failedStatements.push({ statement: statement.trim(), error: err })
        }
      }

      // Verify if tables were created successfully
      console.log("Verifying database setup")
      const { error: verifyError, tables } = await verifyDatabaseSetup(supabase)

      if (verifyError) {
        console.error("Database verification failed:", verifyError)
        return NextResponse.json({ 
          error: 'Failed to create database tables', 
          details: { 
            verifyError, 
            failedStatements,
            tablesFound: tables
          } 
        }, { status: 500 })
      }

      console.log("Database setup completed successfully")
      return NextResponse.json({ 
        success: true,
        tablesCreated: tables
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


async function verifyDatabaseSetup(supabase) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    if (error) return { error, tables: [] };
    return { error: null, tables: ['profiles'] }; // Add more tables as needed
  } catch (error) {
    return { error, tables: [] };
  }
}
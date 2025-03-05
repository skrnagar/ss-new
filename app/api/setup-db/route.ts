
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function GET() {
  return await setupDatabaseHandler()
}

export async function POST() {
  return await setupDatabaseHandler()
}

async function setupDatabaseHandler() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
      console.log('Creating database tables...')

      // Get the SQL from the database.sql file
      const sqlPath = path.join(process.cwd(), 'lib', 'database.sql')
      let sql = ''

      if (fs.existsSync(sqlPath)) {
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

      // Verify table was created
      const { data, error: verifyError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (verifyError) {
        return NextResponse.json({ 
          error: 'Failed to create database tables', 
          details: { verifyError, failedStatements } 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Database tables created successfully' 
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

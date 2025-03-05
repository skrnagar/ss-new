import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase URL or key in environment variables' }, 
        { status: 500 }
      )
    }

    // Use direct supabase-js client to avoid auth/cookie issues
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'database.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Split statements by ';' and filter out empty ones
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    const results = []
    const failedStatements = []

    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      try {
        // For Supabase, use the SQL API directly for DDL statements
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
          .catch(() => supabase.rpc('exec_sql', { query: statement }))
          .catch(() => ({ error: { message: 'RPC method not available' } }))

        if (error) {
          console.error(`Error executing statement:`, error)
          failedStatements.push({ statement, error })
        } else {
          results.push(statement)
        }
      } catch (err) {
        console.error(`Error executing statement:`, err)
        failedStatements.push({ statement, error: err })
      }
    }

    // Check if tables were created
    const { data: profiles, error: verifyError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    // If there are failed statements, return error with details
    if (failedStatements.length > 0 || verifyError) {
      return NextResponse.json(
        { 
          error: 'Failed to create database tables',
          details: { 
            verifyError,
            failedStatements,
            tablesFound: profiles || []
          }
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully',
      tables: results.length
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Database setup failed', details: error }, 
      { status: 500 }
    )
  }
}

// Also handle GET requests for easier browser testing
export async function GET() {
  return POST()
}
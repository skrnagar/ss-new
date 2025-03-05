
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Create a direct client instead of using the server client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'database.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Split statements by ';' and filter out empty ones
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    const results = [];
    let failedStatements = [];

    // Execute statements directly using Supabase's REST API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // If exec_sql function doesn't exist, create it first
          if (error.message.includes('Could not find the function public.exec_sql')) {
            // Try to create the exec_sql function
            const createFunctionSQL = `
              CREATE OR REPLACE FUNCTION exec_sql(sql text)
              RETURNS JSONB
              LANGUAGE plpgsql
              SECURITY DEFINER
              AS $$
              BEGIN
                EXECUTE sql;
                RETURN jsonb_build_object('success', true);
              EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object(
                  'success', false,
                  'error', jsonb_build_object(
                    'message', SQLERRM,
                    'detail', SQLSTATE
                  )
                );
              END;
              $$;
            `;
            
            // Attempt to create the function
            const { error: funcError } = await supabase.auth.admin.executeSql(createFunctionSQL);
            
            if (funcError) {
              console.error("Failed to create exec_sql function:", funcError);
              failedStatements.push({ statement: "Create exec_sql function", error: funcError });
              continue;
            }
            
            // Try the statement again
            const { error: retryError } = await supabase.rpc('exec_sql', { sql: statement });
            
            if (retryError) {
              console.error(`Error executing statement ${i + 1}:`, retryError);
              failedStatements.push({ statement, error: retryError });
            } else {
              results.push({ statement, success: true });
            }
          } else {
            console.error(`Error executing statement ${i + 1}:`, error);
            failedStatements.push({ statement, error });
          }
        } else {
          results.push({ statement, success: true });
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
        failedStatements.push({ statement, error: err });
      }
    }

    // Attempt to create profiles table directly if traditional method failed
    if (failedStatements.length > 0) {
      try {
        // Create profiles table with basic SQL
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
          // Try creating it directly through SQL API
          const createProfilesSQL = `
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
          `;
          
          // Use serviceRole key to execute SQL if available
          await supabase.sql(createProfilesSQL);
        }
      } catch (directErr) {
        console.error("Direct table creation error:", directErr);
      }
    }

    // Verify if tables were created
    const { data: profilesData, error: verifyError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    // Check if verification was successful
    if (verifyError) {
      return NextResponse.json(
        { 
          error: 'Failed to create database tables', 
          details: { 
            verifyError, 
            failedStatements,
            tablesFound: []
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tablesCreated: results.length - failedStatements.length,
      failedStatements: failedStatements.length > 0 ? failedStatements : undefined
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up database', details: error },
      { status: 500 }
    );
  }
}

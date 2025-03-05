import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Profiles table does not exist, creating it...');

      // Read SQL file
      const sqlPath = path.join(process.cwd(), 'lib', 'database.sql');
      let sqlStatements: string[] = [];

      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        sqlStatements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      } else {
        // Fallback: Create profiles table directly
        sqlStatements = [
          `CREATE TABLE IF NOT EXISTS profiles (
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
          )`
        ];
      }

      // Execute statements one by one
      console.log(`Executing ${sqlStatements.length} SQL statements...`);
      const results = [];
      const failedStatements = [];

      // First try to create the exec_sql function if it doesn't exist
      try {
        const createExecSqlFunc = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;

        await supabase.rpc('exec_sql', { sql: createExecSqlFunc }).catch(() => {
          console.log('exec_sql function exists');
        });
      } catch (err) {
        console.log('Note: exec_sql function creation attempted');
      }

      // Execute each statement
      for (let i = 0; i < sqlStatements.length; i++) {
        console.log(`Executing statement ${i+1}/${sqlStatements.length}...`);
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: sqlStatements[i] 
          });

          if (error) {
            console.error(`Error executing statement ${i+1}:`, error);
            failedStatements.push({ index: i, sql: sqlStatements[i], error });
          } else {
            results.push({ index: i, success: true });
          }
        } catch (err) {
          console.error(`Error executing statement ${i+1}:`, err);
          failedStatements.push({ index: i, sql: sqlStatements[i], error: err });
        }
      }

      // Verify if tables were created
      const { data: profilesData, error: verifyError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (verifyError) {
        return NextResponse.json(
          { 
            message: 'Database setup completed with errors',
            failed: failedStatements,
            verify_error: verifyError
          },
          { status: 207 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Database setup completed successfully',
          results,
          failed: failedStatements
        }
      );
    } else {
      return NextResponse.json({ message: 'Profiles table already exists' });
    }
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up database' },
      { status: 500 }
    );
  }
}
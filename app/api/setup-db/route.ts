import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const supabase = createClient();

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

    // Execute statements one by one using RPC
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          failedStatements.push({ statement, error });
        } else {
          results.push({ statement, success: true });
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
        failedStatements.push({ statement, error: err });
      }
    }

    // Verify tables were created
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
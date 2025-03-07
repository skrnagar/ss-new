
import { supabase } from './supabase';
import * as fs from 'fs';
import * as path from 'path';

async function createProfileUpsertFunction() {
  try {
    console.log('Creating profile upsert function...');
    
    // SQL to create a function that handles profile updates safely
    const sql = `
      -- Create a function to safely upsert profile data
      CREATE OR REPLACE FUNCTION safe_upsert_profile(
        user_id UUID,
        username_val TEXT DEFAULT NULL,
        full_name_val TEXT DEFAULT NULL,
        headline_val TEXT DEFAULT NULL,
        bio_val TEXT DEFAULT NULL,
        company_val TEXT DEFAULT NULL,
        position_val TEXT DEFAULT NULL,
        location_val TEXT DEFAULT NULL
      ) RETURNS SETOF profiles AS $$
      BEGIN
        RETURN QUERY
        INSERT INTO profiles (
          id, 
          username, 
          full_name, 
          headline, 
          bio, 
          company, 
          position, 
          location,
          updated_at
        )
        VALUES (
          user_id, 
          COALESCE(username_val, (SELECT username FROM profiles WHERE id = user_id)), 
          full_name_val, 
          headline_val, 
          bio_val, 
          company_val, 
          position_val, 
          location_val,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          username = COALESCE(EXCLUDED.username, profiles.username),
          full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
          headline = COALESCE(EXCLUDED.headline, profiles.headline),
          bio = COALESCE(EXCLUDED.bio, profiles.bio),
          company = COALESCE(EXCLUDED.company, profiles.company),
          position = COALESCE(EXCLUDED.position, profiles.position),
          location = COALESCE(EXCLUDED.location, profiles.location),
          updated_at = NOW()
        RETURNING *;
      END;
      $$ LANGUAGE plpgsql;

      -- Grant execute permission on the function
      GRANT EXECUTE ON FUNCTION safe_upsert_profile TO authenticated;
      GRANT EXECUTE ON FUNCTION safe_upsert_profile TO anon;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error("Error creating profile upsert function:", error);
      return;
    }
    
    console.log("Profile upsert function created successfully");
  } catch (error) {
    console.error("Failed to create profile upsert function:", error);
  }
}

createProfileUpsertFunction();

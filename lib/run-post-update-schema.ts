
// Command to run this file:
// npx ts-node --project tsconfig.json lib/run-post-update-schema.ts

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Import the update script
import './update-post-schema'

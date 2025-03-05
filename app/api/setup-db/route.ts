
import { NextResponse } from 'next/server'
import { setupDatabase } from '@/lib/create-tables'

export async function GET() {
  try {
    const result = await setupDatabase()
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Database tables created successfully' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Error setting up database', 
        details: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in setup-db route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}

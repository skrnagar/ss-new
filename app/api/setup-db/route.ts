
import { NextResponse } from 'next/server'
import { setupDatabase } from '@/lib/create-tables'

export async function GET() {
  try {
    const result = await setupDatabase()
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set up database' }, { status: 500 })
  }
}

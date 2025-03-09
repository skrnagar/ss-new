
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createLegacyClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createLegacyClient()
  await supabase.auth.signOut()

  return NextResponse.json({ success: true }, { status: 200 })
}

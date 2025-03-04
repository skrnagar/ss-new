
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function ProfileRedirect() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  if (profile?.username) {
    redirect(`/profile/${profile.username}`)
  } else {
    redirect('/profile/setup')
  }
}

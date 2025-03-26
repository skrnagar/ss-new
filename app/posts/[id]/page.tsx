
import { createLegacyClient } from "@/lib/supabase-server";
import PostItem from "@/components/post-item";
import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createLegacyClient();

  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch post with author profile
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profile:user_id (
        id,
        username,
        full_name,
        avatar_url,
        position,
        company
      )
    `)
    .eq("id", params.id)
    .single();

  if (!post) {
    redirect('/404');
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card className="mb-6">
        <PostItem post={post} currentUser={session.user} />
      </Card>
    </div>
  );
}

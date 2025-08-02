import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function usePostOperations() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const deletePost = async (postId: string, userId: string, currentUserId: string) => {
    if (userId !== currentUserId) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own posts",
        variant: "destructive",
      });
      return { success: false, error: "Permission denied" };
    }

    setIsDeleting(true);

    try {
      console.log("Attempting to delete post:", postId);
      
      // Delete related data first
      const deletePromises = [
        supabase.from("likes").delete().eq("post_id", postId),
        supabase.from("comments").delete().eq("post_id", postId),
      ];

      await Promise.all(deletePromises);

      // Delete the post
      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (postError) {
        console.error("Supabase delete error:", postError);
        throw postError;
      }

      console.log("Post deleted successfully");
      
      toast({
        title: "Post deleted",
        description: "Your post has been removed successfully",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Delete post error:", error);
      
      let errorMessage = "An error occurred while deleting the post";
      
      if (error?.code === "42501") {
        errorMessage = "Permission denied. You can only delete your own posts.";
      } else if (error?.code === "23503") {
        errorMessage = "Cannot delete post due to related data. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  };

  const updatePost = async (postId: string, content: string, userId: string, currentUserId: string) => {
    if (userId !== currentUserId) {
      toast({
        title: "Permission denied",
        description: "You can only edit your own posts",
        variant: "destructive",
      });
      return { success: false, error: "Permission denied" };
    }

    if (!content.trim()) {
      toast({
        title: "Invalid content",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return { success: false, error: "Content cannot be empty" };
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", postId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Post updated successfully");
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Update post error:", error);
      
      let errorMessage = "An error occurred while updating the post";
      
      if (error?.code === "42501") {
        errorMessage = "Permission denied. You can only edit your own posts.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    deletePost,
    updatePost,
    isDeleting,
    isUpdating,
  };
} 
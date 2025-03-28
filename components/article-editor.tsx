"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ArticleEditorProps {
  initialContent?: string;
  initialTitle?: string;
  articleId?: string;
}

export function ArticleEditor({ initialContent = "", initialTitle = "", articleId }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState(null); // Assuming user object is available

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      else console.error('Error fetching user:', error);
    };
    getUser();
  }, []);


  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Placeholder.configure({
        placeholder: "Start writing your story...",
      }),
    ],
    content: initialContent,
    autofocus: true,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none",
      },
    },
  });

  const autosave = useCallback(async () => {
    if (!editor || !title) return;

    try {
      setSaving(true);
      const content = editor.getHTML();

      if (articleId) {
        const { error } = await supabase
          .from("articles")
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", articleId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("articles")
          .insert({
            title,
            content,
            published: false,
            author_id: user?.id, // Added author_id
          })
          .select()
          .single();

        if (error) throw error;
        if (data) router.push(`/articles/${data.id}/edit`);
      }

      toast({
        title: "Draft saved",
        description: "Your article has been saved as a draft",
      });
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "There was an error saving your article",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editor, title, articleId, router, toast, user]);

  useEffect(() => {
    const saveInterval = setInterval(autosave, 30000);
    return () => clearInterval(saveInterval);
  }, [autosave]);

  const handlePublish = async () => {
    try {
      setSaving(true);

      if (!editor || !title) {
        throw new Error("Please add a title and content");
      }

      let coverImageUrl = "";
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("article-covers")
          .upload(fileName, coverImage);

        if (uploadError) throw uploadError;
        coverImageUrl = data.path;
      }

      const content = editor.getHTML();
      const readTime = Math.ceil(content.split(/\s+/).length / 200); // Assuming 200 words per minute

      if (articleId) {
        const { error } = await supabase
          .from("articles")
          .update({
            title,
            content,
            cover_image: coverImageUrl || undefined,
            published: true,
            published_at: new Date().toISOString(),
            read_time: readTime,
            updated_at: new Date().toISOString(),
          })
          .eq("id", articleId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({
            title,
            content,
            cover_image: coverImageUrl,
            published: true,
            published_at: new Date().toISOString(),
            read_time: readTime,
            author_id: user?.id, // Added author_id
          });

        if (error) throw error;
      }

      toast({
        title: "Article published",
        description: "Your article has been published successfully",
      });

      router.push("/articles");
    } catch (error) {
      toast({
        title: "Error publishing",
        description: "There was an error publishing your article",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold border-none px-0 focus-visible:ring-0"
        />

        <div className="mt-4">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="mb-4"
          />
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          onClick={autosave}
          disabled={saving}
        >
          Save Draft
        </Button>
        <Button
          onClick={handlePublish}
          disabled={saving}
        >
          Publish
        </Button>
      </div>
    </div>
  );
}
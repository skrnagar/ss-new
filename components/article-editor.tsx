"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";

interface ArticleEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialExcerpt?: string;
  initialCoverImage?: string;
  initialCategory?: string;
  articleId?: string;
  isEditing?: boolean;
}

const ToolbarButton = ({ 
  isActive, 
  onClick, 
  children, 
  tooltip 
}: { 
  isActive?: boolean; 
  onClick: () => void; 
  children: React.ReactNode; 
  tooltip: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
      isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-gray-900'
    }`}
    title={tooltip}
  >
    {children}
  </button>
);

export function ArticleEditor({
  initialContent = "",
  initialTitle = "",
  initialExcerpt = "",
  initialCoverImage = "",
  initialCategory = "",
  articleId,
  isEditing = false,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [category, setCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialCoverImage || "");
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      else console.error("Error fetching user:", error);
    };
    getUser();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-6 leading-relaxed text-lg',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'my-6 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'my-6 space-y-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'my-8 border-gray-200',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-lg my-8 max-w-full h-auto',
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your story... Share your insights, experiences, and knowledge with the community.",
      }),
    ],
    content: initialContent,
    autofocus: true,
    editorProps: {
      attributes: {
        class: "prose prose-lg sm:prose-xl max-w-none focus:outline-none min-h-[500px] p-6 prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mb-4 prose-h3:text-xl prose-h3:mb-3 prose-h4:text-lg prose-h4:mb-2 prose-h5:text-base prose-h5:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 prose-a:underline-offset-2 hover:prose-a:decoration-primary prose-strong:text-gray-900 prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-primary/10 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:my-8 prose-blockquote:italic prose-ul:my-6 prose-ol:my-6 prose-li:mb-2 prose-li:text-lg prose-hr:my-12 prose-hr:border-gray-200 prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setReadTime(Math.ceil(words.length / 200));
    },
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change triggered", e.target.files);
    
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log("Invalid file type:", file.type);
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log("File too large:", file.size);
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log("File read successfully");
        setCoverImagePreview(e.target?.result as string);
        toast({
          title: "Image uploaded",
          description: "Cover image has been added successfully",
        });
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({
          title: "Error reading file",
          description: "There was an error reading the image file",
          variant: "destructive",
        });
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          console.log("Reading progress:", Math.round((e.loaded / e.total) * 100) + "%");
        }
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error starting file read:", error);
        toast({
          title: "Error reading file",
          description: "Failed to read the selected image file",
          variant: "destructive",
        });
      }
    } else {
      console.log("No file selected");
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview("");
  };

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
            excerpt,
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
            excerpt,
            published: false,
            author_id: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) router.push(`/articles/${data.id}/edit`);
      }

      toast({
        title: "Draft saved",
        description: "Your changes have been saved automatically",
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
  }, [editor, title, excerpt, articleId, router, toast, user]);

  useEffect(() => {
    const saveInterval = setInterval(autosave, 30000);
    return () => clearInterval(saveInterval);
  }, [autosave]);

  const handlePublish = async () => {
    try {
      setPublishing(true);

      if (!editor || !title) {
        throw new Error("Please add a title and content");
      }

      let coverImageUrl = "";
      if (coverImage) {
        try {
          const fileExt = coverImage.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from("article-covers")
            .upload(fileName, coverImage, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
          
          if (data) {
            coverImageUrl = data.path;
          }
        } catch (uploadError) {
          console.error("Cover image upload error:", uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload cover image. Please try again.",
            variant: "destructive",
          });
          throw uploadError;
        }
      }

      const content = editor.getHTML();

      if (articleId) {
        const { error } = await supabase
          .from("articles")
          .update({
            title,
            content,
            excerpt,
            cover_image: coverImageUrl || undefined,
            published: true,
            published_at: new Date().toISOString(),
            read_time: readTime,
            updated_at: new Date().toISOString(),
          })
          .eq("id", articleId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert({
          title,
          content,
          excerpt,
          cover_image: coverImageUrl,
          published: true,
          published_at: new Date().toISOString(),
          read_time: readTime,
          author_id: user?.id,
        });

        if (error) throw error;
      }

      toast({
        title: isEditing ? "Article updated! 🎉" : "Article published! 🎉",
        description: isEditing ? "Your article has been updated successfully" : "Your article has been published successfully",
      });

      router.push("/articles");
    } catch (error) {
      toast({
        title: "Error publishing",
        description: "There was an error publishing your article",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Writing as</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.user_metadata?.full_name || user?.email}</p>
                </div>
              </div>
              
              {/* Publish button on mobile - same row as user info */}
              <Button
                onClick={handlePublish}
                disabled={publishing || !title || wordCount < 50}
                className="sm:hidden h-8 w-auto px-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm"
              >
                {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    {isEditing ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isEditing ? "Update" : "Publish"}
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min</span>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  className="hidden sm:flex h-9 w-auto px-3"
                >
                  {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="ml-2">{isPreview ? "Edit" : "Preview"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={autosave}
                  disabled={saving}
                  className="hidden sm:flex h-9 w-auto px-3"
                >
                  <Save className="h-4 w-4" />
                  <span className="ml-2">{saving ? "Saving..." : "Save"}</span>
                </Button>
                
                {/* Publish button on desktop */}
                <Button
                  onClick={handlePublish}
                  disabled={publishing || !title || wordCount < 50}
                  className="hidden sm:flex h-9 w-auto px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                                  {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isEditing ? "Update" : "Publish"}
                  </>
                )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title Input */}
            <div className="space-y-3 sm:space-y-4">
              <Input
                type="text"
                placeholder="Enter your article title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold border-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-gray-400"
              />
              
              <Textarea
                placeholder="Write a brief excerpt or summary of your article..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[80px] border-gray-200 focus:border-primary resize-none text-gray-600 text-sm sm:text-base"
                maxLength={300}
              />
              <div className="text-xs text-gray-500 text-right">
                {excerpt.length}/300 characters
              </div>
            </div>

            {/* Cover Image Upload */}
            <Card className="border-dashed border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-gradient-to-br from-gray-50/50 to-white/50">
              <CardContent className="p-4 sm:p-6">
                {coverImagePreview ? (
                  <div className="relative group">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 h-8 w-8 p-0 shadow-lg hover:scale-105 transition-transform"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      Cover Image
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">Add a cover image</h3>
                    <p className="text-gray-600 mb-4 max-w-sm mx-auto text-sm">
                      Upload a high-quality image to make your article more engaging
                    </p>
                    
                    <div className="max-w-xs mx-auto">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-primary file:to-primary/80 file:text-white hover:file:from-primary/90 hover:file:to-primary/70 file:cursor-pointer cursor-pointer file:transition-all file:duration-200 file:shadow-md"
                        id="cover-image-input"
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>JPEG, PNG, GIF</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Max 5MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Editor Toolbar */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Text Formatting */}
                  <ToolbarButton
                    isActive={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    tooltip="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    isActive={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    tooltip="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                  
                  {/* Headings */}
                  <div className="flex items-center gap-1">
                    <ToolbarButton
                      isActive={editor.isActive('heading', { level: 1 })}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      tooltip="Heading 1"
                    >
                      <span className="text-sm font-bold">H1</span>
                    </ToolbarButton>
                    
                    <ToolbarButton
                      isActive={editor.isActive('heading', { level: 2 })}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      tooltip="Heading 2"
                    >
                      <span className="text-sm font-bold">H2</span>
                    </ToolbarButton>
                    
                    <ToolbarButton
                      isActive={editor.isActive('heading', { level: 3 })}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      tooltip="Heading 3"
                    >
                      <span className="text-sm font-bold">H3</span>
                    </ToolbarButton>
                    
                    <ToolbarButton
                      isActive={editor.isActive('heading', { level: 4 })}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                      tooltip="Heading 4"
                    >
                      <span className="text-sm font-bold">H4</span>
                    </ToolbarButton>
                    
                    <ToolbarButton
                      isActive={editor.isActive('heading', { level: 5 })}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                      tooltip="Heading 5"
                    >
                      <span className="text-sm font-bold">H5</span>
                    </ToolbarButton>
                  </div>
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                  
                  {/* Lists */}
                  <ToolbarButton
                    isActive={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    tooltip="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    isActive={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    tooltip="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                  
                  {/* Block Elements */}
                  <ToolbarButton
                    isActive={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    tooltip="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    tooltip="Horizontal Rule"
                  >
                    <div className="w-4 h-0.5 bg-current"></div>
                  </ToolbarButton>
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                  
                  {/* Image Upload */}
                  <ToolbarButton
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            const fileExt = file.name.split(".").pop();
                            const fileName = `${Date.now()}.${fileExt}`;
                            
                            const { error: uploadError, data } = await supabase.storage
                              .from("article-images")
                              .upload(fileName, file, {
                                cacheControl: '3600',
                                upsert: false
                              });
                            
                            if (uploadError) throw uploadError;
                            
                            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${data.path}`;
                            editor.chain().focus().setImage({ src: imageUrl }).run();
                            
                            toast({
                              title: "Image uploaded",
                              description: "Image has been added to your article",
                            });
                          } catch (error) {
                            console.error("Image upload error:", error);
                            toast({
                              title: "Upload failed",
                              description: "Failed to upload image. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }
                      };
                      input.click();
                    }}
                    tooltip="Insert Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </ToolbarButton>
                </div>
              </CardContent>
            </Card>

            {/* Editor Content */}
            <Card className="border-0 shadow-sm min-h-[400px] sm:min-h-[600px]">
              <CardContent className="p-0">
                <EditorContent editor={editor} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Publishing Status */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <span className="hidden sm:inline">Publishing Checklist</span>
                  <span className="sm:hidden">Checklist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${
                    title.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {title.length > 0 ? <Check className="h-2 w-2 sm:h-3 sm:w-3" /> : <X className="h-2 w-2 sm:h-3 sm:w-3" />}
                  </div>
                  <span className="text-xs sm:text-sm">Add a title</span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${
                    wordCount >= 50 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {wordCount >= 50 ? <Check className="h-2 w-2 sm:h-3 sm:w-3" /> : <X className="h-2 w-2 sm:h-3 sm:w-3" />}
                  </div>
                  <span className="text-xs sm:text-sm">Write at least 50 words</span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${
                    excerpt.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {excerpt.length > 0 ? <Check className="h-2 w-2 sm:h-3 sm:w-3" /> : <X className="h-2 w-2 sm:h-3 sm:w-3" />}
                  </div>
                  <span className="text-xs sm:text-sm">Add an excerpt</span>
                </div>
              </CardContent>
            </Card>

            {/* Article Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Article Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Word Count</span>
                  <Badge variant="secondary" className="text-xs">{wordCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Reading Time</span>
                  <Badge variant="secondary" className="text-xs">{readTime} min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Characters</span>
                  <Badge variant="secondary" className="text-xs">{editor.getText().length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="hidden sm:inline">Writing Tips</span>
                  <span className="sm:hidden">Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="text-xs sm:text-sm text-gray-700">
                  <p className="font-medium mb-1 sm:mb-2">💡 Make it engaging</p>
                  <p className="text-gray-600">Start with a compelling hook and use clear, concise language.</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <p className="font-medium mb-1 sm:mb-2">📝 Structure matters</p>
                  <p className="text-gray-600">Use headings, bullet points, and paragraphs to improve readability.</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <p className="font-medium mb-1 sm:mb-2">🎯 Be specific</p>
                  <p className="text-gray-600">Include examples, data, and actionable insights.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
